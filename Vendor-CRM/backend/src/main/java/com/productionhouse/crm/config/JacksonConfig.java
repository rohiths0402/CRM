package com.productionhouse.crm.config;

import com.fasterxml.jackson.databind.cfg.CoercionAction;
import com.fasterxml.jackson.databind.cfg.CoercionInputShape;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JacksonConfig {

    /**
     * The forms send "" for empty dates and amounts (e.g. a payment with no paymentDate).
     * Read those as null instead of failing; required fields are still caught by @NotNull.
     */
    @Bean
    public Jackson2ObjectMapperBuilderCustomizer emptyStringAsNull() {
        return builder -> builder.postConfigurer(mapper -> mapper.coercionConfigDefaults()
                .setCoercion(CoercionInputShape.EmptyString, CoercionAction.AsNull));
    }
}
