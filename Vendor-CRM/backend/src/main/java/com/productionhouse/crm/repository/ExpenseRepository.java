package com.productionhouse.crm.repository;

import com.productionhouse.crm.common.OwnedRepository;
import com.productionhouse.crm.entity.Expense;

public interface ExpenseRepository extends OwnedRepository<Expense> {

    boolean existsByOwnerIdAndProjectId(Long ownerId, Long projectId);
}
