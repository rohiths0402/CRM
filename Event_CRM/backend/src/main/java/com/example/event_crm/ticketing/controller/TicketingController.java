package com.example.event_crm.ticketing.controller;

import com.example.event_crm.ticketing.dto.PromoListResponse;
import com.example.event_crm.ticketing.dto.PromoRequest;
import com.example.event_crm.ticketing.dto.PromoResponse;
import com.example.event_crm.ticketing.dto.PromoStatusRequest;
import com.example.event_crm.ticketing.dto.TierListResponse;
import com.example.event_crm.ticketing.dto.TierRequest;
import com.example.event_crm.ticketing.dto.TierResponse;
import com.example.event_crm.ticketing.dto.TierStatusRequest;
import com.example.event_crm.ticketing.service.PromoService;
import com.example.event_crm.ticketing.service.TierService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ticketing")
public class TicketingController {

    private final TierService tierService;
    private final PromoService promoService;

    public TicketingController(TierService tierService, PromoService promoService) {
        this.tierService = tierService;
        this.promoService = promoService;
    }

    @GetMapping("/tiers")
    public TierListResponse listTiers() {
        return new TierListResponse(tierService.list());
    }

    @PostMapping("/tiers")
    @ResponseStatus(HttpStatus.CREATED)
    public TierResponse createTier(@RequestBody TierRequest request) {
        return tierService.create(request);
    }

    @PutMapping("/tiers/{id}")
    public TierResponse updateTier(@PathVariable Long id, @RequestBody TierRequest request) {
        return tierService.update(id, request);
    }

    @PatchMapping("/tiers/{id}/status")
    public TierResponse updateTierStatus(@PathVariable Long id, @RequestBody TierStatusRequest request) {
        return tierService.updateStatus(id, request.status());
    }

    @DeleteMapping("/tiers/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTier(@PathVariable Long id) {
        tierService.delete(id);
    }

    @GetMapping("/promos")
    public PromoListResponse listPromos() {
        return new PromoListResponse(promoService.list());
    }

    @PostMapping("/promos")
    @ResponseStatus(HttpStatus.CREATED)
    public PromoResponse createPromo(@RequestBody PromoRequest request) {
        return promoService.create(request);
    }

    @PutMapping("/promos/{id}")
    public PromoResponse updatePromo(@PathVariable Long id, @RequestBody PromoRequest request) {
        return promoService.update(id, request);
    }

    @PatchMapping("/promos/{id}/status")
    public PromoResponse updatePromoStatus(@PathVariable Long id, @RequestBody PromoStatusRequest request) {
        return promoService.updateStatus(id, request.enabled());
    }

    @DeleteMapping("/promos/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePromo(@PathVariable Long id) {
        promoService.delete(id);
    }
}