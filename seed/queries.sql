select array_agg(players.email) as other from (
  select * from players
  inner join links on players.id = links.p1
) as first
inner join players on players.id = first.p2

select players.email from (
  select * from players
  inner join links on players.id = links.p1
) as first
inner join players on players.id = first.p2
where players.email like 'b'

select * from links as first inner join links on first.p1 = links.p1;


select id from players where email like 'b';

insert into links (p1, p2) values ((select id from players where email like 'b'), 4);

insert into links (p1, p2) values (
  (select id from players where email like 'd'),
  (select id from players where email like 'b'));


  select players.email from (
    select * from players
    inner join links on players.id = links.p1
    where players.email like 'a'
  ) as first
  inner join players on players.id = first.p2
  where players.email like 'b';
