```
Feature: AddAccount
  Scenario: add_success
    Given login with email "zbcjackson@odd-e.com" and password "password" success
    And login with gmail "zbcjackson@odd-e.com" and password "password" success
    When add account "test1" with balance "1234"
    And add account1 "test1" with balance "1234"
    And add account2 "test1" with balance "1234"
    And add account3 "test1" with balance "1234"
    Then add account "test1" success
    And add account1 "test1" success
    But add account "test1" failed   # but意思是qu
```