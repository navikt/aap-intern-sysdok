# Playbook

## Manglende diagnose

Kontekst: https://nav-it.slack.com/archives/C07NKPFFELT/p1772445387956509

I saker som hadde blitt stoppet eller hadde perioder uten rett, ble det noen ganger ikke sendt diagnose til statistikk. I tillegg lagret vi ikke diagnose for studenter.

For å unngå hull i ble det i de tilfellene vi hadde data etterfylt manuelt (siden det var snakk om kun ca 12 saker). Her er en insert som ble brukt:

```sql
insert
into diagnose (behandling_id, kodeverk, diagnosekode, bidiagnoser)
select beh_id, kodeverk, diagnosekode, bidiagnoser
from (with per_sak as (select sak_id,
                              array_agg(b.id)                              as behandlinger,
                              (jsonb_agg(
                               jsonb_build_object('kodeverk', kodeverk, 'diagnosekode',
                                                  diagnosekode,
                                                  'bidiagnoser', bidiagnoser))
                               filter ( where kodeverk is not null )) -> 0 as diagnoser
                       from behandling b
                                left join diagnose d on b.id = d.behandling_id
                       where (b.sak_id in (select id
                                           from sak
                                           where saksnummer in (
                                                                '4M1WWJK',
                                                                '4LDZA0W',
                                                                '4LZ33F4',
                                                                '4MPZVYo',
                                                                '4LVPZUo',
                                                                '4LSCWA8',
                                                                '4NS5RU8',
                                                                '4ML1ZN4',
                                                                '4LM5ZLC',
                                                                '4N70VV4',
                                                                '4LVE7GW',
                                                                '4N3XFio',
                                                                '4LE4MXC'
                                               )))
                       group by sak_id)
      select beh_id,
             diagnoser ->> 'kodeverk'     as kodeverk,
             diagnoser ->> 'diagnosekode' as diagnosekode,
             case
                 when diagnoser -> 'bidiagnoser' is null then null::text[]
                 else array(select jsonb_array_elements_text(diagnoser -> 'bidiagnoser'))
                 end                      as bidiagnoser
      from per_sak
               cross join lateral unnest(per_sak.behandlinger) as u(beh_id)
      where beh_id not in (select b.id
                           from behandling b
                                    join sak s on b.sak_id = s.id
                                    join diagnose d on b.id = d.behandling_id
                           where s.saksnummer in (
                                                  '4M1WWJK',
                                                  '4LDZA0W',
                                                  '4LZ33F4',
                                                  '4MPZVYo',
                                                  '4LVPZUo',
                                                  '4LSCWA8',
                                                  '4NS5RU8',
                                                  '4ML1ZN4',
                                                  '4LM5ZLC',
                                                  '4N70VV4',
                                                  '4LVE7GW',
                                                  '4N3XFio',
                                                  '4LE4MXC'
                               )
                           order by sak_id, b.id)
        and diagnoser ->> 'kodeverk' is not null) s
```
