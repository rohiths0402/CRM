package com.productionhouse.crm.controller;

import com.productionhouse.crm.entity.User;
import com.productionhouse.crm.service.DashboardService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public DashboardService.Summary summary(@AuthenticationPrincipal User user) {
        return dashboardService.summary(user.getWorkspaceId());
    }
}
