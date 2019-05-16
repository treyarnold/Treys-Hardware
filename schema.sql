create database hardware_shop_db;

use hardware_shop_db;

create table inventory (
	id int not null auto_increment primary key,
    product_name varchar(255) not null,
    department_name varchar(50),
    price float not null,
    stock_quantity int not null
);

insert into inventory 
(product_name, department_name, price, stock_quantity)
values
("Impact Driver", "Power Tools", 39.99, 10),
("Self Sealing Stim Bolts - 100 gross", "Fasteners", 9.99, 10),
("Garden Hose - 50ft.", "Gardening", 14.99, 10),
("Hammer", "Hand Tools", 7.99, 10);

insert into inventory 
(product_name, department_name, price, stock_quantity)
values
("Hand Planer", "Hand Tools", 29.99, 0);