package com.example.event_crm.lineup.service;

import com.example.event_crm.event.model.Event;
import com.example.event_crm.lineup.model.LineupSlot;
import com.example.event_crm.venue.model.Venue;
import org.springframework.stereotype.Component;

import java.time.LocalTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
public class LineupRules {

    private static final int DAY = 1440;
    private static final int CHANGEOVER = 10;
    private static final int SOUNDCHECK_BLOCK = 30;
    private static final int MIN_SET = 10;

    public int toMinutes(String time) {
        String[] parts = time.trim().split(":");
        return Integer.parseInt(parts[0]) * 60 + Integer.parseInt(parts[1]);
    }

    public int minutesOf(LocalTime time) {
        return time.getHour() * 60 + time.getMinute();
    }

    public String clock(int minutes) {
        int total = ((minutes % DAY) + DAY) % DAY;
        int hours = total / 60;
        int mins = total % 60;
        String period = hours >= 12 ? "PM" : "AM";
        int shown = hours % 12 == 0 ? 12 : hours % 12;
        return String.format("%02d:%02d %s", shown, mins, period);
    }

    public String firstProblem(LineupSlot slot, Event event, Venue venue, List<LineupSlot> others) {
        if ("CANCELLED".equals(slot.getStatus())) {
            return null;
        }

        int gates = minutesOf(event.getGatesOpen());
        int curfew = minutesOf(event.getCurfewTime());
        if (curfew <= gates) {
            curfew += DAY;
        }

        int start = normalize(toMinutes(slot.getStartTime()), gates);
        int end = normalize(toMinutes(slot.getEndTime()), gates);

        Map<String, String> errors = new LinkedHashMap<>();

        if (end <= start) {
            errors.put("end", "The set must end after it starts");
        } else if (end - start < MIN_SET) {
            errors.put("end", "A set must be at least " + MIN_SET + " minutes long");
        }

        if (start >= curfew) {
            errors.put("start", "Must start between gates open at " + clock(gates)
                    + " and curfew at " + clock(curfew));
        }
        if (!errors.containsKey("end") && end > curfew) {
            errors.put("end", "Must finish before curfew at " + clock(curfew));
        }

        Integer checkTime = hasText(slot.getSoundcheck()) ? toMinutes(slot.getSoundcheck()) : null;

        if ("Headliner".equals(slot.getRole()) && checkTime == null) {
            errors.put("soundcheck", "A headliner needs a soundcheck time");
        }

        if (checkTime != null) {
            if (checkTime + SOUNDCHECK_BLOCK > gates) {
                errors.put("soundcheck", "Soundcheck must finish before gates open at " + clock(gates));
            } else {
                for (LineupSlot other : others) {
                    if (!hasText(other.getSoundcheck()) || !sameText(other.getStage(), slot.getStage())) {
                        continue;
                    }
                    int otherCheck = toMinutes(other.getSoundcheck());
                    if (overlaps(checkTime, checkTime + SOUNDCHECK_BLOCK, otherCheck, otherCheck + SOUNDCHECK_BLOCK)) {
                        errors.put("soundcheck", other.getArtistName() + " has a soundcheck on " + other.getStage()
                                + " from " + clock(otherCheck) + " to " + clock(otherCheck + SOUNDCHECK_BLOCK));
                        break;
                    }
                }
            }
        }

        if (errors.containsKey("start") || errors.containsKey("end")) {
            return first(errors);
        }

        for (LineupSlot other : others) {
            if (!sameText(other.getStage(), slot.getStage())) {
                continue;
            }
            int otherStart = normalize(toMinutes(other.getStartTime()), gates);
            int otherEnd = normalize(toMinutes(other.getEndTime()), gates);
            if (start < otherEnd + CHANGEOVER && otherStart < end + CHANGEOVER) {
                errors.put("stage", "Clashes with " + other.getArtistName() + " (" + clock(otherStart)
                        + " to " + clock(otherEnd) + ") on " + other.getStage()
                        + ". Keep " + CHANGEOVER + " minutes for changeover.");
                break;
            }
        }

        for (LineupSlot other : others) {
            if (!sameText(other.getArtistName(), slot.getArtistName())) {
                continue;
            }
            int otherStart = normalize(toMinutes(other.getStartTime()), gates);
            int otherEnd = normalize(toMinutes(other.getEndTime()), gates);
            if (overlaps(start, end, otherStart, otherEnd)) {
                errors.put("artistName", slot.getArtistName().trim() + " is already performing on "
                        + other.getStage() + " from " + clock(otherStart) + " to " + clock(otherEnd));
                break;
            }
        }

        if (slot.getGreenRoom() != null) {
            int room = slot.getGreenRoom();
            int rooms = venue == null ? 0 : venue.getGreenRooms();
            String venueName = venue == null ? "This venue" : venue.getName();

            if (rooms <= 0) {
                errors.put("greenRoom", venueName + " has no green rooms");
            } else if (room < 1 || room > rooms) {
                errors.put("greenRoom", venueName + " has " + rooms + " green rooms, pick 1 to " + rooms);
            } else {
                int[] mine = occupancy(slot, start, end);
                for (LineupSlot other : others) {
                    if (other.getGreenRoom() == null || other.getGreenRoom() != room
                            || sameText(other.getArtistName(), slot.getArtistName())) {
                        continue;
                    }
                    int otherStart = normalize(toMinutes(other.getStartTime()), gates);
                    int otherEnd = normalize(toMinutes(other.getEndTime()), gates);
                    int[] theirs = occupancy(other, otherStart, otherEnd);
                    if (overlaps(mine[0], mine[1], theirs[0], theirs[1])) {
                        errors.put("greenRoom", "Green room " + room + " is used by " + other.getArtistName()
                                + " from " + clock(theirs[0]) + " to " + clock(theirs[1]));
                        break;
                    }
                }
            }
        }

        return first(errors);
    }

    private int[] occupancy(LineupSlot slot, int start, int end) {
        int from = hasText(slot.getSoundcheck()) ? toMinutes(slot.getSoundcheck()) : start - 60;
        return new int[]{from, end};
    }

    private int normalize(int minutes, int gates) {
        return minutes < gates ? minutes + DAY : minutes;
    }

    private boolean overlaps(int aStart, int aEnd, int bStart, int bEnd) {
        return aStart < bEnd && bStart < aEnd;
    }

    private boolean sameText(String first, String second) {
        if (first == null || second == null) {
            return false;
        }
        return first.trim().equalsIgnoreCase(second.trim());
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private String first(Map<String, String> errors) {
        return errors.isEmpty() ? null : errors.values().iterator().next();
    }
}