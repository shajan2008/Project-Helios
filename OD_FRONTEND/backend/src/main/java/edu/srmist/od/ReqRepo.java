package edu.srmist.od;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ReqRepo extends JpaRepository<OdRequest, String> {
    List<OdRequest> findByNetid(String netid);
}
