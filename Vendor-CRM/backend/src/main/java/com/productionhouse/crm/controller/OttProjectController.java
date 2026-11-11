package com.productionhouse.crm.controller;

import com.productionhouse.crm.common.CrudController;
import com.productionhouse.crm.entity.OttProject;
import com.productionhouse.crm.entity.User;
import com.productionhouse.crm.exception.ApiException;
import com.productionhouse.crm.repository.ExpenseRepository;
import com.productionhouse.crm.repository.OttProjectRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/ott-projects")
public class OttProjectController extends CrudController<OttProject> {

    private final ExpenseRepository expenseRepository;

    public OttProjectController(OttProjectRepository repository, ExpenseRepository expenseRepository) {
        super(repository, "Project");
        this.expenseRepository = expenseRepository;
    }

    @Override
    protected void beforeDelete(User user, OttProject existing) {
        if (expenseRepository.existsByOwnerIdAndProjectId(user.getWorkspaceId(), existing.getId())) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "This project has expenses recorded against it. Delete those expenses first.");
        }
    }
}
