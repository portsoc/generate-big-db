create database bigdb2019;

create table bigdb2019.lecturer (
  id int primary key auto_increment,
  fname varchar(20),
  lname varchar(20)
);

create table bigdb2019.student (
  id int primary key auto_increment,
  fname varchar(20),
  lname varchar(20),
  tutorID int,
  foreign key (tutorID) references bigdb2019.lecturer(id)
);

create table bigdb2019.unit (
  id int primary key auto_increment,
  code varchar(10),
  name varchar(50)
);

create table bigdb2019.teaching (
  lectID int,
  unitID int,
  foreign key (lectID) references bigdb2019.lecturer(id),
  foreign key (unitID) references bigdb2019.unit(id)
);

create table bigdb2019.enrolment (
  studentID int,
  unitID int,
  year int,
  mark int,
  foreign key (studentID) references bigdb2019.student(id),
  foreign key (unitID) references bigdb2019.unit(id)
);
