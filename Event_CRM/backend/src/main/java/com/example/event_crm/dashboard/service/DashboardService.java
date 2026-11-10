package com.example.event_crm.dashboard.service;

import com.example.event_crm.dashboard.dto.DashboardSummary;
import com.example.event_crm.dashboard.dto.DashboardSummary.Kpi;
import com.example.event_crm.dashboard.dto.DashboardSummary.Proposals;
import com.example.event_crm.dashboard.dto.DashboardSummary.Scope;
import com.example.event_crm.dashboard.dto.DashboardSummary.TrendPoint;
import com.example.event_crm.event.dto.EventLocation;
import com.example.event_crm.event.service.EventLocationService;
import com.example.event_crm.proposal.model.Proposal;
import com.example.event_crm.proposal.repository.ProposalRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class DashboardService {

    private static final List<String> HOURS = List.of(
            "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM",
            "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM");

    private static final int[] HOUR_WEIGHTS = {3, 5, 7, 9, 8, 10, 12, 14, 13, 16, 18, 15};

    private final EventLocationService eventLocationService;
    private final ProposalRepository proposalRepository;

    public DashboardService(EventLocationService eventLocationService, ProposalRepository proposalRepository) {
        this.eventLocationService = eventLocationService;
        this.proposalRepository = proposalRepository;
    }

    public DashboardSummary summary(String eventId) {
        List<EventLocation> all = eventLocationService.all();

        EventLocation selected = null;
        if (!"all".equals(eventId)) {
            for (EventLocation event : all) {
                if (String.valueOf(event.id()).equals(eventId)) {
                    selected = event;
                }
            }
        }
        List<EventLocation> scoped = selected == null ? all : List.of(selected);

        Set<String> states = new HashSet<>();
        long sold = 0;
        long capacity = 0;
        long revenue = 0;
        long sponsors = 0;
        for (EventLocation event : scoped) {
            states.add(event.stateSlug());
            sold += event.ticketsSold();
            capacity += event.capacity();
            revenue += event.grossRevenue();
            sponsors += event.sponsors();
        }

        Scope scope;
        Kpi firstKpi;
        if (selected != null) {
            scope = new Scope(selected.title(), selected.venue() + ", " + selected.city());
            firstKpi = new Kpi("events", "Event date", formatDate(selected.date()),
                    "Status: " + statusLabel(selected.status()), null);
        } else {
            scope = new Scope("All " + all.size() + " events", "Across " + states.size() + " states");
            firstKpi = new Kpi("events", "Total events", String.valueOf(scoped.size()),
                    "Running across " + states.size() + " states", null);
        }

        int progress = capacity == 0 ? 0 : (int) Math.round(sold * 100.0 / capacity);

        List<Kpi> kpis = List.of(
                firstKpi,
                new Kpi("tickets", "Tickets sold", String.format("%,d", sold),
                        "Out of " + String.format("%,d", capacity) + " seats available", progress),
                new Kpi("revenue", "Ticket revenue", formatMoney(revenue),
                        "Money earned from ticket sales", null),
                new Kpi("sponsors", "Brand sponsors", String.valueOf(sponsors),
                        "Sponsor deals signed", null)
        );

        EventLocation live = null;
        for (EventLocation event : all) {
            if ("ONGOING".equals(event.status()) && live == null) {
                live = event;
            }
        }

        return new DashboardSummary(scope, kpis, buildTrend(Math.round(sold * 0.04)), live, pendingProposals());
    }

    private Proposals pendingProposals() {
        long count = proposalRepository.countByStatus("Pending");
        if (count == 0) {
            return null;
        }
        Optional<Proposal> latest = proposalRepository.findFirstByStatusOrderByCreatedAtDesc("Pending");
        String text = latest.map(p -> p.getCompanyName() + ", " + p.getTitle()).orElse("");
        return new Proposals((int) count, text);
    }

    private List<TrendPoint> buildTrend(long ticketsToday) {
        int totalWeight = 0;
        for (int weight : HOUR_WEIGHTS) {
            totalWeight += weight;
        }

        List<TrendPoint> trend = new ArrayList<>();
        for (int i = 0; i < HOURS.size(); i++) {
            int tickets = (int) Math.round((double) ticketsToday * HOUR_WEIGHTS[i] / totalWeight);
            trend.add(new TrendPoint(HOURS.get(i), tickets));
        }
        return trend;
    }

    private String formatDate(String date) {
        if (date == null) {
            return "-";
        }
        return LocalDate.parse(date).format(DateTimeFormatter.ofPattern("d MMM yyyy"));
    }

    private String statusLabel(String status) {
        StringBuilder label = new StringBuilder();
        for (String word : status.split("_")) {
            if (label.length() > 0) {
                label.append(' ');
            }
            label.append(word.charAt(0)).append(word.substring(1).toLowerCase());
        }
        return label.toString();
    }

    private String formatMoney(long amount) {
        if (amount >= 10000000) {
            return String.format("\u20B9%.1f Cr", amount / 10000000.0);
        }
        if (amount >= 100000) {
            return String.format("\u20B9%.1f L", amount / 100000.0);
        }
        return "\u20B9" + String.format("%,d", amount);
    }
}