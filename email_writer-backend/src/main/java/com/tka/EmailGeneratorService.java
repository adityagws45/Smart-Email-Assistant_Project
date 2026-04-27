// package com.tka;

// import com.fasterxml.jackson.databind.JsonNode;
// import com.fasterxml.jackson.databind.ObjectMapper;

// import java.util.List;
// import java.util.Map;

// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.stereotype.Service;
// import org.springframework.web.reactive.function.client.WebClient;

// @Service
// public class EmailGeneratorService {

//     private final WebClient webClient;
//     private final String apiKey;

//     public EmailGeneratorService(WebClient.Builder webClientBuilder,
//                                  @Value("${gemini.api.url}") String baseUrl,
//                                  @Value("${gemini.api.key}") String geminiApiKey) {
//         this.apiKey = geminiApiKey;
//         this.webClient = webClientBuilder.baseUrl(baseUrl).build();
//     }


//     public String generateEmailReply(EmailRequest emailRequest) {

//         // 1. Build prompt
//         String prompt = buildPrompt(emailRequest);

//         // 2. Prepare JSON body
//         ObjectMapper mapper = new ObjectMapper();

// String requestBody;
// try {
//     requestBody = mapper.writeValueAsString(
//         Map.of("contents", List.of(
//             Map.of("parts", List.of(
//                 Map.of("text", prompt)
//             ))
//         ))
//     );
// } catch (Exception e) {
//     throw new RuntimeException(e);
// }

//         // 3. Send request
//         try {
//     String response = webClient.post()
//             .uri(uriBuilder -> uriBuilder
//                     .path("/v1beta/models/gemini-3-flash-preview:generateContent")
//                     .queryParam("key", apiKey)
//                     .build())
//             .header("Content-Type", "application/json")
//             .bodyValue(requestBody)
//             .retrieve()
//             .bodyToMono(String.class)
//             .block();

//             //Extract reponse

//     return extractResponseContent(response);

// } catch (Exception e) {
//     return "Error generating email. Please try again.";
// }
//     }


//     // Stringbuilder is used because we cannot modify string
//     private String buildPrompt(EmailRequest emailRequest) {
//         StringBuilder prompt = new StringBuilder();

//         prompt.append("Generate a professional email reply for the following email: ");

//         //validation
//         if (emailRequest.getTone() != null && !emailRequest.getTone().isEmpty()) {
//             prompt.append("Use a ").append(emailRequest.getTone()).append(" tone. ");
//            //use a professional tone         
//         }

//         prompt.append("Original Email:\n")
//                 .append(emailRequest.getEmailContent());

//         return prompt.toString();
//     }

//     //resonse read
//     //4/Extract response content

//     private String extractResponseContent(String response) {
//         try {
//             ObjectMapper mapper = new ObjectMapper();
//             JsonNode root = mapper.readTree(response);

//             return root.path("candidates")
//                     .get(0)
//                     .path("content")
//                     .path("parts")
//                     .get(0)
//                     .path("text")
//                     .asText();

//         } catch (Exception e) {
//             throw new RuntimeException("Error parsing response", e);
//         }
//     }
// }



package com.tka;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
public class EmailGeneratorService {

    private final WebClient webClient;
    private final String apiKey;

    public EmailGeneratorService(WebClient.Builder webClientBuilder,
                                 @Value("${gemini.api.url}") String baseUrl,
                                 @Value("${gemini.api.key}") String geminiApiKey) {
        this.apiKey = geminiApiKey;
        this.webClient = webClientBuilder.baseUrl(baseUrl).build();
    }

    public String generateEmailReply(EmailRequest emailRequest) {

        // 1. Build prompt
        String prompt = buildPrompt(emailRequest);

        // 2. Prepare JSON body
        ObjectMapper mapper = new ObjectMapper();

        String requestBody;
        try {
            requestBody = mapper.writeValueAsString(
                Map.of("contents", List.of(
                    Map.of("parts", List.of(
                        Map.of("text", prompt)
                    ))
                ))
            );
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        // 3. Send request
        try {
            String response = webClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/v1beta/models/gemini-3-flash-preview:generateContent")
                            .queryParam("key", apiKey)
                            .build())
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return extractResponseContent(response);

        } catch (Exception e) {
            e.printStackTrace(); // 🔥 better debugging
            return "Error generating email. Please try again.";
        }
    }

    // 🔥 UPDATED PROMPT (MAIN CHANGE)
    private String buildPrompt(EmailRequest emailRequest) {

        String tone = (emailRequest.getTone() != null && !emailRequest.getTone().isEmpty())
                ? emailRequest.getTone()
                : "professional";

        return "You are an AI email assistant.\n\n" +

                "Write a " + tone + " email reply to the email below.\n\n" +

                "Tone rules:\n" +
                "- professional: polite, formal, structured\n" +
                "- casual: short, relaxed, simple\n\n" +

                "IMPORTANT RULES:\n" +
                "- Do NOT include subject line\n" +
                "- Do NOT include 'Subject:'\n" +
                "- Generate ONLY the email body\n" +
                "- Generate ONLY ONE reply\n" +
                "- Do NOT give multiple options\n" +
                "- Do NOT explain anything\n" +
                "- Keep it concise (4-6 lines max)\n" +
                "- Make it ready to send\n\n" +

                "Email:\n" +
                emailRequest.getEmailContent();
    }

    // 4. Extract response
    private String extractResponseContent(String response) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response);

            return root.path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();

        } catch (Exception e) {
            throw new RuntimeException("Error parsing response", e);
        }
    }
}