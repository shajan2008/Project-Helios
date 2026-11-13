package edu.srmist.od;

import java.util.Comparator;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/requests")
@CrossOrigin(origins = "${app.cors}")
public class RequestController {
    @Autowired
    ReqRepo repo;

    @Autowired
    Auth auth;

    /**
     * student: own requests; mentor/hod: all
     * (filter by assigned students/department in production).
     */
    @GetMapping
    public List<OdRequest> list(@RequestHeader("Authorization") String header) {
        User user = auth.user(header);
        List<OdRequest> requests = "student".equals(user.role)
                ? repo.findByNetid(user.netid)
                : repo.findAll();

        requests.sort(Comparator.comparing((OdRequest request) -> request.id).reversed());
        return requests;
    }

    @PostMapping
    public OdRequest create(
            @RequestHeader("Authorization") String header,
            @RequestBody OdRequest request
    ) {
        User user = auth.user(header);

        if (!"student".equals(user.role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Students only");
        }

        if (
                request.event == null
                        || request.event.isBlank()
                        || request.fromDate == null
                        || request.toDate == null
                        || request.toDate.compareTo(request.fromDate) < 0
        ) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Check event name and dates"
            );
        }

        request.id = "OD-2026-" + (1000 + repo.count());
        request.netid = user.netid;
        request.studentName = user.name;
        request.dept = user.dept;
        request.status = "PM";
        return repo.save(request);
    }

    /**
     * mentor: PM -> PH | REJECTED.
     * hod: PH -> APPROVED | REJECTED.
     */
    @PatchMapping("/{id}")
    public OdRequest review(
            @RequestHeader("Authorization") String header,
            @PathVariable String id,
            @RequestBody Map<String, String> body
    ) {
        User user = auth.user(header);
        OdRequest request = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Not found"
                ));
        String requiredStatus = "mentor".equals(user.role)
                ? "PM"
                : "hod".equals(user.role) ? "PH" : "";

        if (!requiredStatus.equals(request.status)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Not awaiting your review"
            );
        }

        request.status = "approve".equals(body.get("action"))
                ? ("PM".equals(requiredStatus) ? "PH" : "APPROVED")
                : "REJECTED";
        return repo.save(request);
    }
}
