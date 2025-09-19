```
Feature: AddAccount
  Background:
    Given login with email "zbcjackson@odd-e.com" and password "password" success

  Scenario: add_success
    When add account "test1" with balance "1234"
    Then add account "test1" success

  Scenario Outline: balance_type_error
    When add account "<account>" with balance "<balance>"
    Then add fail with message "<message>"
    Examples:
      | account | balance| message|
      | test2   | test2  | Balance is not a valid number|
      | test3   | test3  | Balance is not a valid number|
```

```
package com.odde.cucumber.step;

import com.odde.cucumber.api.Api;
import com.odde.cucumber.api.dto.User;
import com.odde.cucumber.page.Ui;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.springframework.beans.factory.annotation.Autowired;

import static java.lang.Thread.sleep;


public class AddAccountStep {
    @Autowired
    private Api api;

    @Autowired
    private Ui ui;

    @Given("login with email {string} and password {string} success")
    public void login_with_email_and_password_success(String email, String password) {
        api.signUp(new User(email, password));
        ui.open("
        ui.input("email", email);
        ui.input("password", password);
        ui.click("login");
        ui.assertHaveText("Dashboard");
    }

    @When("add account {string} with balance {string}")
    public void add_account_with_balance(String account, String balance) throws InterruptedException {
        ui.click("Accounts");
        ui.clickByText("Add");
        ui.input("name", account);
        ui.input("balance", balance);
        ui.click("save");
        sleep(5*1000);
    }

    @Then("add account {string} success")
    public void add_success(String account) {
        ui.assertHaveText(account);
    }

    @Then("add fail with message {string}")
    public void add_fail_with_message(String message) {
        ui.assertHaveText(message);
    }
}

```