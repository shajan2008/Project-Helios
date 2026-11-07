package edu.srmist.od;
import org.springframework.boot.*;import org.springframework.boot.autoconfigure.SpringBootApplication;import org.springframework.context.annotation.Bean;
@SpringBootApplication public class OdApplication {
 public static void main(String[] a){SpringApplication.run(OdApplication.class,a);}
 @Bean CommandLineRunner seed(UserRepo u,ReqRepo r){return x->{if(u.count()>0)return;
  u.save(mk("priya","Dr. Priya Patel","mentor"));u.save(mk("rajesh","Dr. Rajesh Menon","hod"));u.save(mk("arun","Arun Kumar","student"));
  String[][] d={{"National Smart India Hackathon","Hackathon","2026-03-20","APPROVED"},{"Inter-College Football Finals","Sports","2026-03-15","APPROVED"},{"AI Symposium Presentation","Workshop","2026-03-12","PM"},{"Tech Fest Organizing Duty","Cultural","2026-03-08","REJECTED"}};
  int i=79;for(String[] q:d){OdRequest o=new OdRequest();o.id="OD-2026-0"+(i++);o.netid="arun";o.studentName="Arun Kumar";o.dept="CSE - 3rd Year";o.event=q[0];o.type=q[1];o.fromDate=q[2];o.toDate=q[2];o.status=q[3];r.save(o);}};}
 static User mk(String id,String n,String role){User x=new User();x.netid=id;x.name=n;x.role=role;x.dept="CSE";return x;}}
