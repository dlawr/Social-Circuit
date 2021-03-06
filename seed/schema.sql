drop table if exists posts;
drop table if exists links;
drop table if exists players;

create table players
  (
    id serial primary key unique,
    email varchar(255) unique not null,
    password_hash varchar(255),
    available boolean,
    goal varchar(255),
    score integer

  );

create table links
  (
    p1 integer references players,
    p2 integer references players,
    primary key (p1,p2)
  );

create table posts
  (
    id serial primary key unique,
    poster_id integer references players,
    get_id integer references players,
    content text
  );
