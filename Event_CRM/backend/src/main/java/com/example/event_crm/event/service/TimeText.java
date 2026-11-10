package com.example.event_crm.event.service;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalTime;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class TimeText {

    private static final Pattern PATTERN = Pattern.compile("^(\\d{1,2}):(\\d{2})\\s*([AaPp][Mm])?$");

    public static String format(LocalTime time) {
        if (time == null) {
            return null;
        }
        int hour = time.getHour();
        int hour12 = hour % 12 == 0 ? 12 : hour % 12;
        String ampm = hour < 12 ? "AM" : "PM";
        return String.format("%02d:%02d %s", hour12, time.getMinute(), ampm);
    }

    public static LocalTime parse(String text) {
        if (text == null || text.isBlank()) {
            return null;
        }

        Matcher matcher = PATTERN.matcher(text.trim());
        if (!matcher.matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Time must look like 05:30 PM");
        }

        int hour = Integer.parseInt(matcher.group(1));
        int minute = Integer.parseInt(matcher.group(2));
        String ampm = matcher.group(3);

        if (ampm != null) {
            hour = hour % 12;
            if (ampm.equalsIgnoreCase("pm")) {
                hour += 12;
            }
        }

        if (hour > 23 || minute > 59) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Time must look like 05:30 PM");
        }
        return LocalTime.of(hour, minute);
    }
}