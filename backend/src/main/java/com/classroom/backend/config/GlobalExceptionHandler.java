package com.classroom.backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Error responses carry a message a person can read. Messages written for people by the
 * services are kept; internal details (SQL, class names, stack fragments) are logged and
 * replaced with a plain message.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    static final String SERVER_ERROR = "Une erreur est survenue de notre côté. Réessayez ; si cela continue, contactez le support.";
    static final String INVALID_DATA = "Certaines informations sont invalides. Vérifiez le formulaire.";
    static final String CONFLICT = "Cet élément existe déjà ou est encore utilisé ailleurs.";
    static final String FORBIDDEN = "Vous n'avez pas les droits nécessaires pour cette action.";

    private static final Pattern TECHNICAL = Pattern.compile(
            "exception|java\\.|org\\.|springframework|hibernate|jdbc|sql|constraint|column|syntax|stack|nested|"
                    + "null|could not|failed to|cannot|json|token '|\\b[a-z]+\\.[a-z]+\\.[a-z]+|[{}<>\\[\\]]",
            Pattern.CASE_INSENSITIVE);

    /** A short sentence written for people (no code, SQL or class names). */
    static boolean isHumanMessage(String message) {
        return message != null && !message.isBlank() && message.length() <= 200 && !TECHNICAL.matcher(message).find();
    }

    private static ResponseEntity<Map<String, Object>> body(HttpStatusCode status, String message, Map<String, String> details) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("status", status.value());
        response.put("error", message);
        if (details != null && !details.isEmpty()) response.put("details", details);
        return ResponseEntity.status(status).body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new LinkedHashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String field = error instanceof FieldError fe ? fe.getField() : error.getObjectName();
            errors.put(field, error.getDefaultMessage());
        });
        String first = errors.values().stream().filter(GlobalExceptionHandler::isHumanMessage).findFirst().orElse(null);
        // Annotation defaults are English ("must not be blank"): only French sentences are passed on.
        boolean french = first != null && first.matches(".*[éèàùçêâîôû].*|^(Le|La|Les|L'|Un|Une|Veuillez|Merci|Ce|Cette).*");
        return body(HttpStatus.BAD_REQUEST, french ? first : INVALID_DATA, errors);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleUnreadable(HttpMessageNotReadableException ex) {
        log.warn("Unreadable request body: {}", ex.getMessage());
        return body(HttpStatus.BAD_REQUEST, INVALID_DATA, null);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrity(DataIntegrityViolationException ex) {
        log.warn("Data integrity violation: {}", ex.getMostSpecificCause().getMessage());
        return body(HttpStatus.CONFLICT, CONFLICT, null);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatus(ResponseStatusException ex) {
        String reason = ex.getReason();
        if (ex.getStatusCode().is5xxServerError()) {
            log.error("Server error", ex);
            return body(ex.getStatusCode(), SERVER_ERROR, null);
        }
        return body(ex.getStatusCode(), isHumanMessage(reason) ? reason : INVALID_DATA, null);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        if (isHumanMessage(ex.getMessage())) {
            // Business rule written for people, e.g. "Cet e-mail est déjà utilisé."
            return body(HttpStatus.BAD_REQUEST, ex.getMessage().trim(), null);
        }
        log.error("Unexpected error", ex);
        return body(HttpStatus.INTERNAL_SERVER_ERROR, SERVER_ERROR, null);
    }

    @ExceptionHandler({ BadCredentialsException.class, UsernameNotFoundException.class })
    public ResponseEntity<Map<String, Object>> handleBadCredentials(RuntimeException ex) {
        String message = ex.getMessage();
        if (!isHumanMessage(message) || "Bad credentials".equalsIgnoreCase(message)) {
            message = "Identifiant ou mot de passe incorrect.";
        }
        return body(HttpStatus.UNAUTHORIZED, message, null);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {
        return body(HttpStatus.FORBIDDEN, FORBIDDEN, null);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleOther(Exception ex) {
        log.error("Unexpected error", ex);
        return body(HttpStatus.INTERNAL_SERVER_ERROR, SERVER_ERROR, null);
    }
}
