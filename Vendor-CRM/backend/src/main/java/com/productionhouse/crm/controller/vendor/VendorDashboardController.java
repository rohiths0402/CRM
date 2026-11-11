package com.productionhouse.crm.controller.vendor;

import com.productionhouse.crm.entity.OttProject;
import com.productionhouse.crm.entity.User;
import com.productionhouse.crm.repository.OttProjectRepository;
import com.productionhouse.crm.service.VendorDashboardService;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/vendor")
public class VendorDashboardController {

    private final VendorDashboardService dashboardService;
    private final OttProjectRepository projectRepository;

    public VendorDashboardController(VendorDashboardService dashboardService, OttProjectRepository projectRepository) {
        this.dashboardService = dashboardService;
        this.projectRepository = projectRepository;
    }

    @GetMapping("/dashboard")
    public VendorDashboardService.Summary dashboard(@AuthenticationPrincipal User user) {
        return dashboardService.summary(user.getWorkspaceId());
    }

    /**
     * OTT project names for the vendor forms' project dropdowns. Vendor-only logins can't call
     * /ott-projects, so they get the names (and nothing else) here.
     */
    @GetMapping("/projects")
    public List<String> projects(@AuthenticationPrincipal User user) {
        return projectRepository.findAllByOwnerIdOrderByCreatedAtDesc(user.getWorkspaceId()).stream()
                .map(OttProject::getProjectName)
                .toList();
    }
}
