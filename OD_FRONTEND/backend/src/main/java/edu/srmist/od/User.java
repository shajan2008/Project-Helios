package edu.srmist.od;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User {
    @Id
    public String netid;

    public String name;
    public String role;
    public String dept;
    public String docType;
    public boolean profileDone;
}
