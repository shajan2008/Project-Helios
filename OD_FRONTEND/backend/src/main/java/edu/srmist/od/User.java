package edu.srmist.od;
import jakarta.persistence.*;
@Entity @Table(name="users") public class User { @Id public String netid; public String name,role,dept,docType; public boolean profileDone; }
