package com.example.demo.Controller;

import com.example.demo.DTO.SendResponse;
import com.example.demo.Security.VerifiedUser;
import com.example.demo.Service.RequestService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
public class RequestController {
    private final RequestService requestService;

    public RequestController(RequestService requestService) {
        this.requestService = requestService;
    }

    @GetMapping("/sent")
    @VerifiedUser
    public List<SendResponse> getSent(){
        return requestService.getSent();

    }
    @GetMapping("/recieved")
    @VerifiedUser
    public List<SendResponse> getReceived(){
        return requestService.getReceived();

    }
    @PostMapping("/{requestId}/accept")
    @VerifiedUser
    public String acceptBarter(@PathVariable String requestId){
        return requestService.acceptBarter(requestId);

    }
    @DeleteMapping("/{requestId}/reject")
    @VerifiedUser
    public String RejectBarter(@PathVariable String requestId){
        return requestService.rejectBarter(requestId);

    }
}
