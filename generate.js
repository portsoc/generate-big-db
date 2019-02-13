const randomName = require('node-random-name');
const randomSentence = require('random-sentence');
const randomLorem = require('random-lorem');
const capitalize = require('capitalize');

const DBNAME = 'bigdb2019';

console.log(`
select "re-creating database ${DBNAME}" as "";
select concat("starting at ", current_date(), " ", current_time()) as "";

drop database if exists ${DBNAME};
create database ${DBNAME};

create table ${DBNAME}.lecturer (
  id int primary key auto_increment,
  fname varchar(20),
  lname varchar(20)
);

create table ${DBNAME}.student (
  id int primary key auto_increment,
  fname varchar(20),
  lname varchar(20),
  tutorID int,
  foreign key (tutorID) references ${DBNAME}.lecturer(id)
);

create table ${DBNAME}.unit (
  id int primary key auto_increment,
  code varchar(10),
  name varchar(50)
);

create table ${DBNAME}.teaching (
  lectID int,
  unitID int,
  foreign key (lectID) references ${DBNAME}.lecturer(id),
  foreign key (unitID) references ${DBNAME}.unit(id)
);

create table ${DBNAME}.enrolment (
  studentID int,
  unitID int,
  year int,
  mark int,
  foreign key (studentID) references ${DBNAME}.student(id),
  foreign key (unitID) references ${DBNAME}.unit(id)
);
`.trim());

console.log();

function selectRandom(arr) {
  return arr[Math.floor(Math.random()*arr.length)];
}

// select round robin but with skips
function selectRR(arr) {
  if (Math.random() < .1) arr.unshift(arr.pop());
  const retval = arr.pop();
  arr.unshift(retval);
  return retval;
}

const CONSONANTS = [ 'b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n',
                     'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z' ];
const VOWELS = [ 'a', 'e', 'i', 'o', 'u' ];

function randomCode(sylCount) {
  let retval = '';
  for (let i=0; i<sylCount; i+=1) {
    retval += selectRandom(CONSONANTS);
    retval += selectRandom(VOWELS);
  }
}

/* lecturers
 *
 *
 *   #      ######  ####  ##### #    # #####  ###### #####   ####
 *   #      #      #    #   #   #    # #    # #      #    # #
 *   #      #####  #        #   #    # #    # #####  #    #  ####
 *   #      #      #        #   #    # #####  #      #####       #
 *   #      #      #    #   #   #    # #   #  #      #   #  #    #
 *   ###### ######  ####    #    ####  #    # ###### #    #  ####
 *
 *
 */

console.log('select "creating lecturers" as "";');
const lecturerIDs = [];

let id=10000;
for (let i=0; i<1000; i+=1) {
  id += Math.max(Math.floor(Math.random()*10)-7, 1);
  lecturerIDs.push({id,tutees:0,units:[]});
  const fname = randomName({ random: Math.random, first: true });
  const lname = randomName({ random: Math.random, last: true });
  console.log(`
    insert into ${DBNAME}.lecturer values (${id}, '${fname}', '${lname}');`.trim());
}

console.log();

/* students
 *
 *
 *    ####  ##### #    # #####  ###### #    # #####  ####
 *   #        #   #    # #    # #      ##   #   #   #
 *    ####    #   #    # #    # #####  # #  #   #    ####
 *        #   #   #    # #    # #      #  # #   #        #
 *   #    #   #   #    # #    # #      #   ##   #   #    #
 *    ####    #    ####  #####  ###### #    #   #    ####
 *
 *
 */

console.log('select "creating students" as "";');
console.log('select "0% done" as "";');
const studentIDs = [];

const YEARS = 6;
const students = YEARS * 8000;

id=200000;
for (let i=0; i<students; i+=1) {
  id += Math.max(Math.floor(Math.random()*10)-6, 1);
  studentIDs.push({id,marks:[]});
  const fname = randomName({ random: Math.random, first: true });
  const lname = randomName({ random: Math.random, last: true });
  const tutorId = selectRR(lecturerIDs);
  tutorId.tutees += 1;
  console.log(`
    insert into ${DBNAME}.student values (${id}, '${fname}', '${lname}', ${tutorId.id});`.trim());
  logPercent(studentIDs.length, students, 20);
}

function logPercent(curr, total, count=10) {
  if (curr % (Math.round(total/count)) === 0) {
    console.log(`select "${Math.round(curr / total * 100)}% done" as "";\n`)
  }
}

console.log();


/* units
 *
 *
 *   #    # #    # # #####  ####
 *   #    # ##   # #   #   #
 *   #    # # #  # #   #    ####
 *   #    # #  # # #   #        #
 *   #    # #   ## #   #   #    #
 *    ####  #    # #   #    ####
 *
 *
 */

console.log('select "creating units" as "";');
const unitIDs = [];
const unitCodes = [];

id=3000;
for (let i=0; i<1000; i+=1) {
  id += Math.max(Math.floor(Math.random()*10)-6, 1);
  let code;
  do {
    code = randomLorem({min: 3, max: 6}).toUpperCase();
  } while (unitCodes.includes(code));
  unitIDs.push({id,students:0});
  unitCodes.push(code);
  let title = capitalize.words(randomSentence({min: 2, max: 5}));
  title = title.substring(0,title.length-1);
  console.log(`
    insert into ${DBNAME}.unit values (${id}, '${code}', '${title}');`.trim());
}

console.log();

/* teaching
 *
 *
 *   ##### ######   ##    ####  #    # # #    #  ####
 *     #   #       #  #  #    # #    # # ##   # #    #
 *     #   #####  #    # #      ###### # # #  # #
 *     #   #      ###### #      #    # # #  # # #  ###
 *     #   #      #    # #    # #    # # #   ## #    #
 *     #   ###### #    #  ####  #    # # #    #  ####
 *
 *
 */

console.log('select "creating teaching assignments" as "";');
for (const unit of unitIDs) {
  const lecturer = selectRR(lecturerIDs);
  lecturer.units.push(unit);
  console.log(`
    insert into ${DBNAME}.teaching values (${lecturer.id}, ${unit.id});`.trim());
}

for (const lecturer of lecturerIDs) {
  const unit = selectRandom(unitIDs);
  if (!lecturer.units.includes(unit)) {
    lecturer.units.push(unit);
    console.log(`
      insert into ${DBNAME}.teaching values (${lecturer.id}, ${unit.id});`.trim());
  }
}

console.log();

/* marks
 *
 *
 *   #    #   ##   #####  #    #  ####
 *   ##  ##  #  #  #    # #   #  #
 *   # ## # #    # #    # ####    ####
 *   #    # ###### #####  #  #        #
 *   #    # #    # #   #  #   #  #    #
 *   #    # #    # #    # #    #  ####
 *
 *
 */

console.log('select "creating enrolments and marks" as "";');
const yearNow = new Date().getFullYear() - 1;

let marks = 0;

for (const student of studentIDs) {
  const yearStart = yearNow - Math.floor(Math.random()*YEARS);
  const yearEnd = Math.min(yearStart+2, yearNow);
  for (let year = yearStart; year <= yearEnd; year += 1) {
    for (let i=0; i<6; i+=1) {
      const unit = selectRR(unitIDs);
      const mark = Math.round(Math.random()*100);
      student.marks.push({unit,year,mark});
      marks += 1;
    }
  }
}

let done=0;
for (const student of studentIDs) {
  for (const markObj of student.marks) {
    console.log(`
      insert into ${DBNAME}.enrolment values (${student.id}, ${markObj.unit.id}, ${markObj.year}, ${markObj.mark});`.trim());
    done += 1;
    logPercent(done, marks, 100);
  }
}


/* stats
 *
 *
 *    ####  #####   ##   #####  ####
 *   #        #    #  #    #   #
 *    ####    #   #    #   #    ####
 *        #   #   ######   #        #
 *   #    #   #   #    #   #   #    #
 *    ####    #   #    #   #    ####
 *
 *
 */

const lecturerUnits = lecturerIDs.map(x => x.units.length);
console.log(`select "count of units for lecturers: min ${Math.min(...lecturerUnits)}, max ${Math.max(...lecturerUnits)}" as "";`);

const lecturerTutees = lecturerIDs.map(x => x.tutees);
console.log(`select "count of tutees for lecturers: min ${Math.min(...lecturerTutees)}, max ${Math.max(...lecturerTutees)}" as "";`);

console.log(`select "mark count: ${marks}" as "";`);

console.log(`select concat("all done at ", current_date(), " ", current_time()) as "";`);
