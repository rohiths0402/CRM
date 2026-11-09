package com.example.event_crm.auth;

import org.springframework.stereotype.Service;

@Service
public class SmsService {


    public void sendCode(String mobile, String code) {
        System.out.println("Mobile code for " + mobile + ": " + code);
    }
}