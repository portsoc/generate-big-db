-- queries

use bigdb2019;
use bigdb2019_2;


-- find out the most common student first name, and how many students have that first name

select fname, count(fname)
from student
group by fname
order by count(fname) desc
limit 1;


-- do we have any students that have the same full name?

select fname, lname
from student
group by fname, lname
having count(*) > 1;


-- how many students have we had in every year for the last 4 years?

select count(distinct studentID), year
from enrolment
where year >= 2015
group by year
order by year;


-- how many personal tutees has the lecturer Alysia Ciarletta (id 10606) had over the years?

select count(*)
from student
where tutorID = 10606;

-- find name
select * from lecturer where id = 10606;


-- how many personal tutees does Alysia Ciarletta (id 10606) have this year?

select count(distinct id)
from student
join enrolment on studentID = id
where tutorID = 10606
and year = 2018;


-- which 10 lecturers have the fewest personal tutees who are studying this academic year (2018)?

select l.id, l.fname, l.lname, count(distinct s.id) as tutees
from lecturer l
join student s on s.tutorID = l.id
join enrolment e on e.studentID = s.id
where e.year = 2013
group by l.id
order by tutees asc, l.lname, l.fname
limit 10;


-- find all the marks for this year in the unit ZAREM, include student information.

select s.id, s.fname, s.lname, e.mark
from student s
join enrolment e on s.id = e.studentID
join unit u on e.unitID = u.id
where e.year = 2018
  and u.code = 'IPRON' -- 'ZAREM'
order by s.lname, s.fname;

-- selecting a good unit
select u.*, count(e.studentID)
from unit u
join enrolment e on e.unitID = u.id
where e.year = 2018
group by u.id
order by count(e.studentID);

-- IPRON



-- who did really well (with a mark of at least 80) in ZAREM in 2017?
-- I want to email them to offer them a part-time job, so just give me their
-- email address in the form up<student id>@myport.ac.uk, e.g. up123456@myport.ac.uk

select concat('up', s.id, '@myport.ac.uk') as email
from student s
join enrolment e on s.id = e.studentID
join unit u on e.unitID = u.id
where e.year = 2017
  and u.code = 'IPRON' -- 'ZAREM'
  and e.mark >= 80;


-- for lecturer Nadia Delagatta (id 10069) find out the average marks of her tutees this year

select s.id, s.fname, s.lname, round(avg(mark)) as avg_mark
from student s
join enrolment e on e.studentID = s.id
where s.tutorID = 11107 -- 10069
  and e.year = 2018
group by s.id
order by s.lname, s.fname;

-- selecting a good lecturer
select * from lecturer order by lname, fname;
-- 11107


-- find the lecturer with the best average mark this year of all their personal tutees

select l.id, l.fname, l.lname, avg(mark)
from lecturer l
join student s on s.tutorID = l.id
join enrolment e on e.studentID = s.id
where e.year = 2018
group by l.id
order by avg(mark) desc
limit 1;

-- control:
select avg(mark)
from enrolment
join student on studentID = id
where tutorID = 10295
  and year = 2018;


-- for lecturer Horace Curella (id 10251) find which unit has the best average mark over all the years

select u.*, avg(mark)
from unit u
join teaching t on t.unitID = u.id
join enrolment e on e.unitID = u.id
where t.lectID = 10133 -- 10251
group by u.id
order by avg(mark) desc
limit 1;

-- selecting a good lecturer
select l.*, count(*)
from lecturer l
join teaching t on t.lectID = l.id
group by l.id
having count(*) > 2;

select t.lectID, u.*, avg(mark)
from unit u
join teaching t on t.unitID = u.id
join enrolment e on e.unitID = u.id
where t.lectID in (
  select l.id
  from lecturer l
  join teaching t on t.lectID = l.id
  group by l.id
  having count(*) > 2
)
group by u.id
order by t.lectID, avg(mark) desc;


-- for the unit above, find out how the average mark has changed each year

select year, avg(mark)
from enrolment
where unitID = 3121
group by year;
