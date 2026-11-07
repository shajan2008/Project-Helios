package edu.srmist.od;
import java.util.*;import org.springframework.beans.factory.annotation.Autowired;import org.springframework.http.HttpStatus;import org.springframework.web.bind.annotation.*;import org.springframework.web.server.ResponseStatusException;
@RestController @RequestMapping("/api/requests") @CrossOrigin(origins="${app.cors}")
public class RequestController {
 @Autowired ReqRepo repo; @Autowired Auth auth;
 /** student: own requests; mentor/hod: all (filter by assigned students/department in production). */
 @GetMapping public List<OdRequest> list(@RequestHeader("Authorization") String h){User u=auth.user(h);
  List<OdRequest> l="student".equals(u.role)?repo.findByNetid(u.netid):repo.findAll();l.sort(Comparator.comparing((OdRequest r)->r.id).reversed());return l;}
 @PostMapping public OdRequest create(@RequestHeader("Authorization") String h,@RequestBody OdRequest b){User u=auth.user(h);
  if(!"student".equals(u.role))throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Students only");
  if(b.event==null||b.event.isBlank()||b.fromDate==null||b.toDate==null||b.toDate.compareTo(b.fromDate)<0)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Check event name and dates");
  b.id="OD-2026-"+(1000+repo.count());b.netid=u.netid;b.studentName=u.name;b.dept=u.dept;b.status="PM";return repo.save(b);}
 /** mentor: PM -> PH | REJECTED.  hod: PH -> APPROVED | REJECTED */
 @PatchMapping("/{id}") public OdRequest review(@RequestHeader("Authorization") String h,@PathVariable String id,@RequestBody Map<String,String> b){User u=auth.user(h);
  OdRequest r=repo.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Not found"));
  String need="mentor".equals(u.role)?"PM":"hod".equals(u.role)?"PH":"";
  if(!need.equals(r.status))throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Not awaiting your review");
  r.status="approve".equals(b.get("action"))?("PM".equals(need)?"PH":"APPROVED"):"REJECTED";return repo.save(r);}
}
