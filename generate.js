const randomName = require('node-random-name');
const randomSentence = require('random-sentence');
const randomLorem = require('random-lorem');
const capitalize = require('capitalize');

const DBNAME = 'bigdb2019_2';

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
  primary key (lectId, unitId),
  foreign key (lectID) references ${DBNAME}.lecturer(id),
  foreign key (unitID) references ${DBNAME}.unit(id)
);

create table ${DBNAME}.enrolment (
  studentID int,
  unitID int,
  year int,
  mark int,
  primary key (studentId, unitId, year),
  foreign key (studentID) references ${DBNAME}.student(id),
  foreign key (unitID) references ${DBNAME}.unit(id)
);
`.trim());

console.log();

function selectRandom(arr) {
  return arr[Math.floor(Math.random()*arr.length)];
}

function selectNormal(arr) {
  const rand = (Math.random() + Math.random())/2;
  return arr[Math.floor(rand*arr.length)];
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

let currTable;
let currValues;
function addInsert(table, values) {
  const N = 1000;

  if (currTable == null) {
    startInserts(table);
  } else if (currTable != table || currValues.length >= N) {
    endInserts();
    startInserts(table);
  }

  currValues.push(values);
}
function startInserts(table) {
  currTable = table;
  currValues = [];
}
function endInserts() {
  if (currTable == null) return;

  console.log(`insert into ${currTable} values\n  ${currValues.join(',\n  ')};`);
  currTable = null;
  currValues = null;
}

function logPercent(curr, total, count=10) {
  if (curr % (Math.round(total/count)) === 0) {
    endInserts();
    console.log(`select "${Math.round(curr / total * 100)}% done" as "";\n`)
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
  addInsert(`${DBNAME}.lecturer`, `(${id}, '${fname}', '${lname}')`)
}

endInserts();
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
const studentIDs = [];

const YEARS = 6;
const students = YEARS * 8000;

id=200000;
for (let i=0; i<students; i+=1) {
  id += Math.max(Math.floor(Math.random()*10)-6, 1);
  studentIDs.push({id,marks:[],units:[]});
  const fname = randomName({ random: Math.random, first: true });
  const lname = randomName({ random: Math.random, last: true });
  const tutorId = selectRR(lecturerIDs);
  tutorId.tutees += 1;
  addInsert(`${DBNAME}.student`, `(${id}, '${fname}', '${lname}', ${tutorId.id})`)
}

endInserts();
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
  addInsert(`${DBNAME}.unit`, `(${id}, '${code}', '${title}')`)
}

endInserts();
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
  addInsert(`${DBNAME}.teaching`, `(${lecturer.id}, ${unit.id})`)
}

for (const lecturer of lecturerIDs) {
  const unit = selectRandom(unitIDs);
  if (!lecturer.units.includes(unit)) {
    lecturer.units.push(unit);
    addInsert(`${DBNAME}.teaching`, `(${lecturer.id}, ${unit.id})`)
  }
}

endInserts();
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
      let unit;
      do {
        unit = selectNormal(unitIDs);
      } while (student.units.includes(unit));
      const mark = Math.round((Math.random()+Math.random())*50);
      student.marks.push({unit,year,mark});
      student.units.push(unit);
      marks += 1;
    }
  }
}

let done=0;
for (const student of studentIDs) {
  for (const markObj of student.marks) {
    addInsert(`${DBNAME}.enrolment`, `(${student.id}, ${markObj.unit.id}, ${markObj.year}, ${markObj.mark})`)
    done += 1;
    logPercent(done, marks, 10);
  }
}

endInserts();
console.log();

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
