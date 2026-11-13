package edu.srmist.od;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class OdApplication {
    public static void main(String[] args) {
        SpringApplication.run(OdApplication.class, args);
    }

    @Bean
    CommandLineRunner seed(UserRepo users, ReqRepo requests) {
        return args -> {
            if (users.count() > 0) {
                return;
            }

            users.save(createUser("priya", "Dr. Priya Patel", "mentor"));
            users.save(createUser("rajesh", "Dr. Rajesh Menon", "hod"));
            users.save(createUser("arun", "Arun Kumar", "student"));

            String[][] requestData = {
                {
                    "National Smart India Hackathon",
                    "Hackathon",
                    "2026-03-20",
                    "APPROVED",
                },
                {
                    "Inter-College Football Finals",
                    "Sports",
                    "2026-03-15",
                    "APPROVED",
                },
                {
                    "AI Symposium Presentation",
                    "Workshop",
                    "2026-03-12",
                    "PM",
                },
                {
                    "Tech Fest Organizing Duty",
                    "Cultural",
                    "2026-03-08",
                    "REJECTED",
                },
            };

            int id = 79;
            for (String[] data : requestData) {
                OdRequest request = new OdRequest();
                request.id = "OD-2026-0" + (id++);
                request.netid = "arun";
                request.studentName = "Arun Kumar";
                request.dept = "CSE - 3rd Year";
                request.event = data[0];
                request.type = data[1];
                request.fromDate = data[2];
                request.toDate = data[2];
                request.status = data[3];
                requests.save(request);
            }
        };
    }

    private static User createUser(String netid, String name, String role) {
        User user = new User();
        user.netid = netid;
        user.name = name;
        user.role = role;
        user.dept = "CSE";
        return user;
    }
}
