package com.example.demo.Service;

import com.example.demo.DTO.SendResponse;
import com.example.demo.Models.BarterPost;
import com.example.demo.Models.BarterRequest;
import com.example.demo.Models.Status;
import com.example.demo.Models.Users;
import com.example.demo.Repo.BarterRequestRepo;
import com.example.demo.Repo.PostRepo;
import com.example.demo.Repo.UserRepo;
import com.example.demo.Security.ProjectUtils;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class RequestService {
    private final ProjectUtils projectUtils;
    private final BarterRequestRepo barterRequestRepo;
    private final UserRepo userRepo;
    private final PostRepo postRepo;

    public RequestService(ProjectUtils projectUtils, BarterRequestRepo barterRequestRepo, UserRepo userRepo, PostRepo postRepo) {
        this.projectUtils = projectUtils;
        this.barterRequestRepo = barterRequestRepo;
        this.userRepo=userRepo;
        this.postRepo = postRepo;
    }

    private SendResponse maptoSendResponse(BarterRequest saved) {
        SendResponse response = new SendResponse();
        response.setStatus(saved.getStatus());
        response.setSkillsWanted(saved.getSkillsWanted());
        Users user = userRepo.findById(saved.getSenderId()).orElseThrow(()->
                new RuntimeException("Invalid Sender"));

        response.setSenderName(user.getName());
        response.setSenderId(saved.getSenderId());
        Users user2 = userRepo.findById(saved.getReceiverId()).orElseThrow(()->
                new RuntimeException("Invalid Target"));

        response.setReceiverName(user2.getName());
        response.setReceiverId(saved.getReceiverId());
        response.setPostId(saved.getPostId());
        response.setId(saved.getId());
        response.setCreatedAt(saved.getCreatedAt());
        return response;
    }
    public List<SendResponse> getSent() {
        Users users = projectUtils.getCurrent();
        List<BarterRequest> requests = barterRequestRepo.findAllBySenderIdOrderByCreatedAtDesc(users.getId());
        List<SendResponse> responses = new ArrayList<>();
        for (int i = 0; i < requests.size(); i++) {
            responses.add(maptoSendResponse(requests.get(i)));
        }

        return responses;
    }

    public List<SendResponse> getReceived() {
        Users users = projectUtils.getCurrent();
        List<BarterRequest> requests = barterRequestRepo.findAllByReceiverIdOrderByCreatedAtDesc(users.getId());
        List<SendResponse> responses = new ArrayList<>();
        for (int i = 0; i < requests.size(); i++) {
            responses.add(maptoSendResponse(requests.get(i)));
        }

        return responses;
    }

    public String acceptBarter(String requestId) {
        BarterRequest request = barterRequestRepo.findById(requestId)
                .orElseThrow(()-> new RuntimeException("Invalid request"));
        if(request.getStatus() != Status.PENDING){
            throw new RuntimeException("Request already processed");
        }
        BarterPost barterPost = postRepo.findById(request.getPostId())
                .orElseThrow(()-> new RuntimeException("Invalid request"));

        Users current = projectUtils.getCurrent();

        if(!request.getReceiverId().equals(current.getId())){
            throw new RuntimeException("Invalid Access");
        }
        request.setReceiverId(current.getId());
        request.setStatus(Status.COMPLETED);

        barterPost.setActive(false);

        barterRequestRepo.save(request);
        postRepo.save(barterPost);
        return "Request Accepted Successfully";

    }

    public String rejectBarter(String requestId){

        BarterRequest request = barterRequestRepo.findById(requestId)
                .orElseThrow(() ->
                        new RuntimeException("Invalid Request"));

        Users current = projectUtils.getCurrent();

        if(!request.getReceiverId().equals(current.getId())){
            throw new RuntimeException("Invalid Access");
        }

        if(request.getStatus() != Status.PENDING){
            throw new RuntimeException("Request already processed");
        }

        barterRequestRepo.delete(request);

        return "Request Rejected Successfully";
    }
}
