package com.productionhouse.crm.repository;

import com.productionhouse.crm.common.OwnedRepository;
import com.productionhouse.crm.entity.CoordinationTask;

public interface CoordinationTaskRepository extends OwnedRepository<CoordinationTask> {

    long countByOwnerIdAndAssignee(Long ownerId, String assignee);
}
