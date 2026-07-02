package com.sciencetoppers.api.controller;

import com.sciencetoppers.api.model.PaymentInfo;
import com.sciencetoppers.api.service.FirebaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/payment-info")
public class PaymentInfoController {

    @Autowired
    private FirebaseService firebaseService;

    @GetMapping("/{subjectId}")
    public PaymentInfo getPaymentInfo(@PathVariable String subjectId) throws ExecutionException, InterruptedException {
        return firebaseService.getPaymentInfo(subjectId).get();
    }

    @GetMapping("/admin")
    public PaymentInfo getAdminPaymentInfo() throws ExecutionException, InterruptedException {
        return firebaseService.getAdminPaymentInfo().get();
    }
}
