package edu.srmist.od;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "od_requests")
public class OdRequest {
    @Id
    public String id;

    public String netid;
    public String studentName;
    public String dept;
    public String event;
    public String venue;
    public String type;
    public String fromDate;
    public String toDate;
    public String status;

    @Column(length = 2000)
    public String description;
}
