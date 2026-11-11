package com.example.event_crm.ticketing.service;

import com.example.event_crm.event.repository.EventRepository;
import com.example.event_crm.ticketing.dto.PromoRequest;
import com.example.event_crm.ticketing.dto.PromoResponse;
import com.example.event_crm.ticketing.model.PromoCode;
import com.example.event_crm.ticketing.model.TicketTier;
import com.example.event_crm.ticketing.repository.PromoCodeRepository;
import com.example.event_crm.ticketing.repository.TicketTierRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

@Service
public class PromoService {

    private final PromoCodeRepository promoRepository;
    private final TicketTierRepository tierRepository;
    private final EventRepository eventRepository;

    public PromoService(PromoCodeRepository promoRepository, TicketTierRepository tierRepository,
                        EventRepository eventRepository) {
        this.promoRepository = promoRepository;
        this.tierRepository = tierRepository;
        this.eventRepository = eventRepository;
    }

    public List<PromoResponse> list() {
        List<PromoResponse> result = new ArrayList<>();
        for (PromoCode promo : promoRepository.findAll()) {
            result.add(toResponse(promo));
        }
        return result;
    }

    public PromoResponse create(PromoRequest request) {
        String code = cleanCode(request.code());
        LocalDate expiresOn = checkValues(request, code);

        if (expiresOn.isBefore(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Expiry date is in the past");
        }
        if (promoRepository.existsByCode(code)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "The code already exists");
        }

        PromoCode promo = new PromoCode();
        fill(promo, request, code, expiresOn);
        promo.setEnabled(true);
        return toResponse(promoRepository.save(promo));
    }

    public PromoResponse update(Long id, PromoRequest request) {
        PromoCode promo = find(id);
        String code = cleanCode(request.code());
        LocalDate expiresOn = checkValues(request, code);

        if (!code.equals(promo.getCode())) {
            if (promo.getUsed() > 0) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "The code cannot change after customers have used it");
            }
            if (promoRepository.existsByCode(code)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "The code already exists");
            }
        }
        if (request.maxUses() < promo.getUsed()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Max uses is lower than the uses already counted");
        }

        fill(promo, request, code, expiresOn);
        return toResponse(promoRepository.save(promo));
    }

    public PromoResponse updateStatus(Long id, Boolean enabled) {
        if (enabled == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Send enabled as true or false");
        }
        PromoCode promo = find(id);
        promo.setEnabled(enabled);
        return toResponse(promoRepository.save(promo));
    }

    public void delete(Long id) {
        PromoCode promo = find(id);
        if (promo.getUsed() > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Customers have used this code, disable it instead");
        }
        promoRepository.delete(promo);
    }

    private String cleanCode(String code) {
        String cleaned = code == null ? "" : code.trim().toUpperCase();
        if (!cleaned.matches("[A-Z0-9]{4,15}")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Code must be 4 to 15 capital letters or numbers");
        }
        return cleaned;
    }

    private LocalDate checkValues(PromoRequest request, String code) {
        String type = request.discountType();
        if (!"PERCENT".equals(type) && !"FLAT".equals(type)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Discount type must be PERCENT or FLAT");
        }
        if ("PERCENT".equals(type) && (request.value() < 1 || request.value() > 90)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Percent discount must be between 1 and 90");
        }
        if ("FLAT".equals(type) && request.value() < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Flat discount must be at least 1 rupee");
        }
        if (request.maxUses() < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Max uses must be at least 1");
        }
        if (request.eventId() != null && !eventRepository.existsById(request.eventId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a valid event");
        }

        LocalDate expiresOn = parseDate(request.expiresOn());

        if ("FLAT".equals(type)) {
            long cheapest = cheapestPrice(request.eventId());
            if (cheapest >= 0 && request.value() >= cheapest) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "A flat discount must be lower than the cheapest ticket");
            }
        }
        return expiresOn;
    }

    private long cheapestPrice(Long eventId) {
        List<TicketTier> tiers = eventId == null ? tierRepository.findAll() : tierRepository.findByEventId(eventId);
        long cheapest = -1;
        for (TicketTier tier : tiers) {
            if (cheapest < 0 || tier.getPrice() < cheapest) {
                cheapest = tier.getPrice();
            }
        }
        return cheapest;
    }

    private LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Expiry date is required");
        }
        try {
            return LocalDate.parse(value);
        } catch (DateTimeParseException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Date must be in yyyy-MM-dd format");
        }
    }

    private void fill(PromoCode promo, PromoRequest request, String code, LocalDate expiresOn) {
        promo.setCode(code);
        promo.setDiscountType(request.discountType());
        promo.setValue(request.value());
        promo.setEventId(request.eventId());
        promo.setMaxUses(request.maxUses());
        promo.setExpiresOn(expiresOn);
    }

    private PromoCode find(Long id) {
        return promoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Promo code not found"));
    }

    private PromoResponse toResponse(PromoCode promo) {
        return new PromoResponse(
                promo.getId(),
                promo.getCode(),
                promo.getDiscountType(),
                promo.getValue(),
                promo.getEventId(),
                promo.getMaxUses(),
                promo.getUsed(),
                promo.getExpiresOn() == null ? "" : promo.getExpiresOn().toString(),
                promo.isEnabled()
        );
    }
}