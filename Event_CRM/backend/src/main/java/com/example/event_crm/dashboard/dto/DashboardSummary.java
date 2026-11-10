package com.example.event_crm.dashboard.dto;

import com.example.event_crm.event.dto.EventLocation;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;

public record DashboardSummary(
        Scope scope,
        List<Kpi> kpis,
        List<TrendPoint> salesTrend,
        EventLocation liveEvent,
        Proposals pendingProposals
) {

    public record Scope(String label, String detail) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record Kpi(String key, String label, String value, String note, Integer progress) {
    }

    public record TrendPoint(String hour, int tickets) {
    }

    public record Proposals(int count, String latest) {
    }
}