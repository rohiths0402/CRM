package com.productionhouse.crm.controller;

import com.productionhouse.crm.common.CrudController;
import com.productionhouse.crm.entity.CoordinationTask;
import com.productionhouse.crm.repository.CoordinationTaskRepository;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/tasks")
public class CoordinationTaskController extends CrudController<CoordinationTask> {

    public CoordinationTaskController(CoordinationTaskRepository repository) {
        super(repository, "Task");
    }
}
