package com.productionhouse.crm.service;

import com.productionhouse.crm.common.BaseEntity;
import com.productionhouse.crm.entity.CastCrewMember;
import com.productionhouse.crm.entity.Contract;
import com.productionhouse.crm.entity.Expense;
import com.productionhouse.crm.entity.OttProject;
import com.productionhouse.crm.entity.Payment;
import com.productionhouse.crm.entity.ProductionHouse;
import com.productionhouse.crm.entity.ProductionSchedule;
import com.productionhouse.crm.entity.ShootingLocation;
import com.productionhouse.crm.repository.CastCrewMemberRepository;
import com.productionhouse.crm.repository.ContractRepository;
import com.productionhouse.crm.repository.ExpenseRepository;
import com.productionhouse.crm.repository.OttProjectRepository;
import com.productionhouse.crm.repository.PaymentRepository;
import com.productionhouse.crm.repository.ProductionHouseRepository;
import com.productionhouse.crm.repository.ProductionScheduleRepository;
import com.productionhouse.crm.repository.ShootingLocationRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.function.Function;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Everything the dashboard shows, computed from the user's own records. */
@Service
public class DashboardService {

    private static final int LIST_SIZE = 5;

    private final ProductionHouseRepository houseRepository;
    private final OttProjectRepository projectRepository;
    private final CastCrewMemberRepository castCrewRepository;
    private final ShootingLocationRepository locationRepository;
    private final ProductionScheduleRepository scheduleRepository;
    private final ExpenseRepository expenseRepository;
    private final ContractRepository contractRepository;
    private final PaymentRepository paymentRepository;

    public DashboardService(ProductionHouseRepository houseRepository, OttProjectRepository projectRepository,
                            CastCrewMemberRepository castCrewRepository, ShootingLocationRepository locationRepository,
                            ProductionScheduleRepository scheduleRepository, ExpenseRepository expenseRepository,
                            ContractRepository contractRepository, PaymentRepository paymentRepository) {
        this.houseRepository = houseRepository;
        this.projectRepository = projectRepository;
        this.castCrewRepository = castCrewRepository;
        this.locationRepository = locationRepository;
        this.scheduleRepository = scheduleRepository;
        this.expenseRepository = expenseRepository;
        this.contractRepository = contractRepository;
        this.paymentRepository = paymentRepository;
    }

    public record Stats(long productionHouses, long activeProjects, long shootingProjects,
                        long castCrew, long shootingLocations) {
    }

    /** progress is estimated from how much of startDate..endDate has passed (100 once Completed). */
    public record ProjectOverview(Long id, String name, String platform, String type, String manager,
                                  int progress, String status, LocalDate date) {
    }

    public record BudgetSnapshot(BigDecimal totalBudget, BigDecimal spent, BigDecimal remaining,
                                 BigDecimal percentUsed) {
    }

    public record UpcomingSchedule(Long id, String project, String activity, String location,
                                   LocalDate date, String time, String status) {
    }

    public record PendingActions(long draftContracts, long pendingPayments, BigDecimal pendingPaymentsAmount,
                                 long plannedSchedules) {
    }

    /** type is one of: project, cast-crew, contract, payment, schedule, location, production-house. */
    public record Activity(String type, String title, String detail, Instant time) {
    }

    public record Summary(Stats stats, List<ProjectOverview> projects, BudgetSnapshot budget,
                          List<UpcomingSchedule> upcomingSchedules, PendingActions pendingActions,
                          List<Activity> recentActivities) {
    }

    @Transactional(readOnly = true)
    public Summary summary(Long ownerId) {
        LocalDate today = LocalDate.now();

        List<ProductionHouse> houses = houseRepository.findAllByOwnerIdOrderByCreatedAtDesc(ownerId);
        List<OttProject> projects = projectRepository.findAllByOwnerIdOrderByCreatedAtDesc(ownerId);
        List<CastCrewMember> castCrew = castCrewRepository.findAllByOwnerIdOrderByCreatedAtDesc(ownerId);
        List<ShootingLocation> locations = locationRepository.findAllByOwnerIdOrderByCreatedAtDesc(ownerId);
        List<ProductionSchedule> schedules = scheduleRepository.findAllByOwnerIdOrderByCreatedAtDesc(ownerId);
        List<Expense> expenses = expenseRepository.findAllByOwnerIdOrderByCreatedAtDesc(ownerId);
        List<Contract> contracts = contractRepository.findAllByOwnerIdOrderByCreatedAtDesc(ownerId);
        List<Payment> payments = paymentRepository.findAllByOwnerIdOrderByCreatedAtDesc(ownerId);

        Stats stats = new Stats(
                houses.size(),
                projects.stream().filter(p -> Set.of("Planning", "In Progress").contains(p.getStatus())).count(),
                projects.stream().filter(p -> "In Progress".equals(p.getStatus())).count(),
                castCrew.size(),
                locations.size());

        List<ProjectOverview> overview = projects.stream()
                .map(p -> new ProjectOverview(p.getId(), p.getProjectName(), p.getPlatform(), p.getProjectType(),
                        p.getProjectManager(), progress(p, today), p.getStatus(), p.getStartDate()))
                .toList();

        BigDecimal totalBudget = sum(projects.stream().map(OttProject::getBudget).toList());
        BigDecimal spent = sum(expenses.stream().map(Expense::getAmount).toList());
        BigDecimal percentUsed = totalBudget.signum() == 0 ? BigDecimal.ZERO
                : spent.multiply(BigDecimal.valueOf(100)).divide(totalBudget, 1, RoundingMode.HALF_UP);
        BudgetSnapshot budget = new BudgetSnapshot(totalBudget, spent, totalBudget.subtract(spent), percentUsed);

        List<UpcomingSchedule> upcoming = schedules.stream()
                .filter(s -> !s.getDate().isBefore(today))
                .filter(s -> Set.of("Planned", "Confirmed").contains(s.getStatus()))
                .sorted(Comparator.comparing(ProductionSchedule::getDate)
                        .thenComparing(ProductionSchedule::getStartTime))
                .limit(LIST_SIZE)
                .map(s -> new UpcomingSchedule(s.getId(), s.getProject(), s.getTitle(), s.getLocation(),
                        s.getDate(), s.getStartTime().toString(), s.getStatus()))
                .toList();

        List<Payment> unpaidOutgoing = payments.stream()
                .filter(p -> "Outgoing".equals(p.getDirection()))
                .filter(p -> Set.of("Pending", "Overdue").contains(p.getStatus()))
                .toList();
        PendingActions pending = new PendingActions(
                contracts.stream().filter(c -> "Draft".equals(c.getStatus())).count(),
                unpaidOutgoing.size(),
                sum(unpaidOutgoing.stream().map(Payment::getAmount).toList()),
                schedules.stream().filter(s -> "Planned".equals(s.getStatus())).count());

        List<Activity> activities = new ArrayList<>();
        addActivities(activities, projects, "project", OttProject::getProjectName);
        addActivities(activities, castCrew, "cast-crew", CastCrewMember::getName);
        addActivities(activities, contracts, "contract", Contract::getTitle);
        addActivities(activities, payments, "payment", Payment::getTitle);
        addActivities(activities, schedules, "schedule", ProductionSchedule::getTitle);
        addActivities(activities, locations, "location", ShootingLocation::getName);
        addActivities(activities, houses, "production-house", ProductionHouse::getCompanyName);
        List<Activity> recent = activities.stream()
                .sorted(Comparator.comparing(Activity::time).reversed())
                .limit(LIST_SIZE)
                .toList();

        return new Summary(stats, overview, budget, upcoming, pending, recent);
    }

    private static int progress(OttProject project, LocalDate today) {
        if ("Completed".equals(project.getStatus())) return 100;
        if ("Planning".equals(project.getStatus())) return 0;
        long total = ChronoUnit.DAYS.between(project.getStartDate(), project.getEndDate());
        if (total <= 0) return 0;
        long elapsed = ChronoUnit.DAYS.between(project.getStartDate(), today);
        return (int) Math.max(0, Math.min(99, elapsed * 100 / total));
    }

    private static <E extends BaseEntity> void addActivities(List<Activity> out, List<E> records, String type,
                                                             Function<E, String> name) {
        for (E record : records) {
            boolean edited = record.getUpdatedAt().isAfter(record.getCreatedAt().plusSeconds(1));
            String label = type.replace('-', ' ');
            String title = Character.toUpperCase(label.charAt(0)) + label.substring(1) + (edited ? " updated" : " added");
            out.add(new Activity(type, title, name.apply(record), record.getUpdatedAt()));
        }
    }

    private static BigDecimal sum(List<BigDecimal> values) {
        return values.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
