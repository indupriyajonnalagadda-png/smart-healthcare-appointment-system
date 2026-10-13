package com.smarthealth.ai;

import com.smarthealth.dto.ai.DoctorRecommendationRequest;
import com.smarthealth.dto.ai.DoctorRecommendationResponse;
import com.smarthealth.dto.doctor.DoctorSummaryDto;
import com.smarthealth.entity.DoctorProfile;
import com.smarthealth.mapper.EntityDtoMapper;
import com.smarthealth.repository.DoctorProfileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DoctorRecommendationService {

    private static final Logger log = LoggerFactory.getLogger(DoctorRecommendationService.class);

    @Value("${smarthealth.ai.provider:RULE_BASED}")
    private String configuredProvider;

    private final GeminiLlmProvider geminiLlmProvider;
    private final OpenAiLlmProvider openAiLlmProvider;
    private final RuleBasedRecommendationProvider ruleBasedProvider;
    private final EmergencyKeywordDetector emergencyDetector;
    private final DepartmentMatchingService departmentMatchingService;
    private final DoctorProfileRepository doctorProfileRepository;
    private final EntityDtoMapper mapper;

    public DoctorRecommendationService(GeminiLlmProvider geminiLlmProvider,
                                       OpenAiLlmProvider openAiLlmProvider,
                                       RuleBasedRecommendationProvider ruleBasedProvider,
                                       EmergencyKeywordDetector emergencyDetector,
                                       DepartmentMatchingService departmentMatchingService,
                                       DoctorProfileRepository doctorProfileRepository,
                                       EntityDtoMapper mapper) {
        this.geminiLlmProvider = geminiLlmProvider;
        this.openAiLlmProvider = openAiLlmProvider;
        this.ruleBasedProvider = ruleBasedProvider;
        this.emergencyDetector = emergencyDetector;
        this.departmentMatchingService = departmentMatchingService;
        this.doctorProfileRepository = doctorProfileRepository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public DoctorRecommendationResponse recommendDoctor(DoctorRecommendationRequest request) {
        String symptoms = request.getSymptomDescription();
        boolean isEmergency = emergencyDetector.isEmergency(symptoms);

        LlmProvider provider = resolveProvider();
        log.info("Evaluating symptoms with AI provider: {}", provider.getProviderName());

        LlmRecommendationResult rawResult;
        try {
            rawResult = provider.getRecommendation(symptoms, request.getAge(), request.getGender());
        } catch (Exception ex) {
            log.warn("AI provider exception, failing back to RuleBasedRecommendationProvider: {}", ex.getMessage());
            rawResult = ruleBasedProvider.getRecommendation(symptoms, request.getAge(), request.getGender());
        }

        // Validate returned department and specializations against database
        DepartmentMatchingService.MatchedResult matched = departmentMatchingService.matchAndValidate(
                rawResult.getDepartment(), rawResult.getSpecializations()
        );

        DoctorRecommendationResponse response = new DoctorRecommendationResponse();
        response.setRecommendedDepartment(matched.getDepartment().getName());
        response.setDepartmentId(matched.getDepartment().getId());
        response.setRecommendedSpecializations(matched.getValidatedSpecializations());
        response.setReason(rawResult.getReason());
        response.setProviderUsed(rawResult.getProviderName());

        if (isEmergency) {
            response.setUrgency("EMERGENCY");
            response.setEmergency(true);
            response.setEmergencyMessage(emergencyDetector.getEmergencyWarning());
        } else {
            response.setUrgency(rawResult.getUrgency() != null ? rawResult.getUrgency() : "ROUTINE");
            response.setEmergency(false);
            response.setEmergencyMessage(null);
        }

        // Retrieve suitable active doctors in this department / specialization
        List<DoctorProfile> matchingDoctors = doctorProfileRepository.searchDoctors(
                null, matched.getDepartment().getId(), null, "APPROVED", true, PageRequest.of(0, 6)
        ).getContent();

        List<DoctorSummaryDto> doctorDtos = matchingDoctors.stream()
                .map(mapper::toDoctorSummaryDto)
                .collect(Collectors.toList());

        response.setRecommendedDoctors(doctorDtos);
        return response;
    }

    private LlmProvider resolveProvider() {
        if ("GEMINI".equalsIgnoreCase(configuredProvider) && geminiLlmProvider.isAvailable()) {
            return geminiLlmProvider;
        }
        if ("OPENAI".equalsIgnoreCase(configuredProvider) && openAiLlmProvider.isAvailable()) {
            return openAiLlmProvider;
        }
        return ruleBasedProvider;
    }
}
