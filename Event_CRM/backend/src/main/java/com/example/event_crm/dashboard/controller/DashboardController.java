package com.example.event_crm.dashboard.controller;

import com.example.event_crm.dashboard.dto.DashboardSummary;
import com.example.event_crm.dashboard.service.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public DashboardSummary summary(@RequestParam(defaultValue = "all") String eventId) {
        return dashboardService.summary(eventId);
    }
}