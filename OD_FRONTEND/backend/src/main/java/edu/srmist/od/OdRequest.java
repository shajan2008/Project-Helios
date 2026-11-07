package edu.srmist.od;
import jakarta.persistence.*;
@Entity @Table(name="od_requests") public class OdRequest { @Id public String id; public String netid,studentName,dept,event,venue,type,fromDate,toDate,status; @Column(length=2000) public String description; }
