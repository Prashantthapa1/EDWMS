INSERT INTO roles (id, name, description, is_active, created_at)
    VALUES ('f2f2983b-02a2-4c98-afc4-bd5f6ac2ca4e', 'ADMIN', 'Admin can manage the entire system', true, NOW());

INSERT INTO roles (id, name, description, is_active, created_at)
    VALUES ('99e0075c-1b60-47a0-9501-a50d633ce05f', 'MANAGER', 'Managers can manage the documents of the system', true, NOW());

INSERT INTO roles (id, name, description, is_active, created_at)
    VALUES ('e1bba44d-c392-44b5-bbff-f8239aba1208', 'REVIEWER', 'Reviewers can review documents submitter by employees', true, NOW());

INSERT INTO roles (id, name, description, is_active, created_at)
    VALUES ('4e3056ac-f839-429f-848c-fc967df66201', 'EMPLOYEE', 'Employee can draft, submit and manage their documents.', true, NOW());