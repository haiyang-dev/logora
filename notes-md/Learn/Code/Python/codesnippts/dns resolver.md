dnspython3

```python
def get_cname(domain: str) -> dict:
    records = {}
    record_types = ['SOA', 'A', 'TXT', 'NS', 'CNAME', 'MX', 'NAPTR', 'PTR', 'SRV', 'SPF', 'AAAA', 'CAA', 'DS']
    record_types = ['CNAME']
    for record_type in record_types:
        cname = domain
        record_list = [cname]
        while True:
            try:
                answer = dns.resolver.query(cname, record_type)
                for rdata in answer:
                    cname = rdata.to_text()
                    record_list.append(cname)
            except (dns.resolver.NoAnswer, dns.resolver.NXDOMAIN, dns.resolver.NoNameservers):
                break        
        records[record_type] = record_list
    return records
```