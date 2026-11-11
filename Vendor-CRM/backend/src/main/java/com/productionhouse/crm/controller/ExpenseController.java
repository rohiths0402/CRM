package com.productionhouse.crm.controller;

import com.productionhouse.crm.common.CrudController;
import com.productionhouse.crm.entity.Expense;
import com.productionhouse.crm.entity.User;
import com.productionhouse.crm.exception.ApiException;
import com.productionhouse.crm.repository.ExpenseRepository;
import com.productionhouse.crm.repository.OttProjectRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/expenses")
public class ExpenseController extends CrudController<Expense> {

    private final OttProjectRepository projectRepository;

    public ExpenseController(ExpenseRepository repository, OttProjectRepository projectRepository) {
        super(repository, "Expense");
        this.projectRepository = projectRepository;
    }

    @Override
    protected void beforeSave(User user, Expense body) {
        if (projectRepository.findByIdAndOwnerId(body.getProjectId(), user.getWorkspaceId()).isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Selected project does not exist.");
        }
    }
}
