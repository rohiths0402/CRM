package com.productionhouse.crm.controller;

import com.productionhouse.crm.entity.Expense;
import com.productionhouse.crm.entity.OttProject;
import com.productionhouse.crm.entity.User;
import com.productionhouse.crm.repository.ExpenseRepository;
import com.productionhouse.crm.repository.OttProjectRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Budget figures for the Budgets & Expenses page. Project budgets come from OTT projects;
 * spending comes from expenses. Expenses themselves are managed at /expenses.
 */
@RestController
@RequestMapping("/budgets")
public class BudgetController {

    private final OttProjectRepository projectRepository;
    private final ExpenseRepository expenseRepository;

    public BudgetController(OttProjectRepository projectRepository, ExpenseRepository expenseRepository) {
        this.projectRepository = projectRepository;
        this.expenseRepository = expenseRepository;
    }

    public record ProjectBudget(Long id, String name, BigDecimal budget, BigDecimal spent,
                                BigDecimal remaining, BigDecimal percentage) {
    }

    public record Totals(BigDecimal budget, BigDecimal spent, BigDecimal remaining, BigDecimal unpaid) {
    }

    public record BudgetSummary(List<ProjectBudget> projects, Totals totals) {
    }

    /** Optional projectId limits the totals to one project, like the page's project filter. */
    @GetMapping
    public BudgetSummary summary(@AuthenticationPrincipal User user,
                                 @RequestParam(required = false) Long projectId) {
        List<OttProject> projects = projectRepository.findAllByOwnerIdOrderByCreatedAtDesc(user.getWorkspaceId());
        List<Expense> expenses = expenseRepository.findAllByOwnerIdOrderByCreatedAtDesc(user.getWorkspaceId());

        Map<Long, BigDecimal> spentByProject = expenses.stream().collect(Collectors.groupingBy(
                Expense::getProjectId, Collectors.reducing(BigDecimal.ZERO, Expense::getAmount, BigDecimal::add)));

        List<ProjectBudget> rows = projects.stream().map(project -> {
            BigDecimal spent = spentByProject.getOrDefault(project.getId(), BigDecimal.ZERO);
            return new ProjectBudget(project.getId(), project.getProjectName(), project.getBudget(), spent,
                    project.getBudget().subtract(spent), percent(spent, project.getBudget()));
        }).toList();

        List<ProjectBudget> scoped = projectId == null ? rows
                : rows.stream().filter(row -> row.id().equals(projectId)).toList();
        List<Expense> scopedExpenses = projectId == null ? expenses
                : expenses.stream().filter(expense -> expense.getProjectId().equals(projectId)).toList();

        BigDecimal budget = sum(scoped.stream().map(ProjectBudget::budget).toList());
        BigDecimal spent = sum(scopedExpenses.stream().map(Expense::getAmount).toList());
        BigDecimal unpaid = sum(scopedExpenses.stream()
                .filter(expense -> !"Paid".equals(expense.getStatus()))
                .map(Expense::getAmount).toList());

        return new BudgetSummary(rows, new Totals(budget, spent, budget.subtract(spent), unpaid));
    }

    static BigDecimal percent(BigDecimal part, BigDecimal whole) {
        if (whole == null || whole.signum() == 0) return BigDecimal.ZERO;
        return part.multiply(BigDecimal.valueOf(100)).divide(whole, 1, RoundingMode.HALF_UP);
    }

    static BigDecimal sum(List<BigDecimal> values) {
        return values.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
