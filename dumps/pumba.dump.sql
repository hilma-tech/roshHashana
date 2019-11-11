-- MySQL dump 10.13  Distrib 5.7.27, for Linux (x86_64)
--
-- Host: localhost    Database: myproject
-- ------------------------------------------------------
-- Server version	5.7.27-0ubuntu0.18.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `ACL`
--

DROP TABLE IF EXISTS `ACL`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ACL` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `model` varchar(512) DEFAULT NULL,
  `property` varchar(512) DEFAULT NULL,
  `accessType` varchar(512) DEFAULT NULL,
  `permission` varchar(512) DEFAULT NULL,
  `principalType` varchar(512) DEFAULT NULL,
  `principalId` varchar(512) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ACL`
--

LOCK TABLES `ACL` WRITE;
/*!40000 ALTER TABLE `ACL` DISABLE KEYS */;
/*!40000 ALTER TABLE `ACL` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `AccessToken`
--

DROP TABLE IF EXISTS `AccessToken`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `AccessToken` (
  `id` varchar(255) NOT NULL,
  `ttl` int(11) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  `scopes` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `AccessToken`
--

LOCK TABLES `AccessToken` WRITE;
/*!40000 ALTER TABLE `AccessToken` DISABLE KEYS */;
INSERT INTO `AccessToken` VALUES ('07QqoJLESxI6AQxDBjU1ihqpNB3EnBOLtz9bngPk1CuqgCg70lkOxDIkoS7veQw3',1209600,'2019-11-10 10:12:10',1,NULL),('19MzFGCbAV1jXXBpOJwk7QRAmG3qG5MPbmODTV401CYGVoqEghCUsI9RSqdRPGMZ',1209600,'2019-10-22 11:04:41',1,NULL),('1D0q5iIHTjDEIgdz4F6APkde5W7ABVgXIjZJU3NcAR8ECXRcvJ6J9OYCO9ixZc1D',1209600,'2019-11-10 10:26:02',1,NULL),('1IOCRNTA5rT7d5YFz5VyTGCBm6vutWpAMXjJVcjGK3GTcay7CslhjCYmdGum1yHE',1209600,'2019-11-06 14:03:44',1,NULL),('4VHWJByNO5HYYy2HSKvSPhmQcJBKKhg7yHS8E2cuQsYZU2rPiyXuj4pmH71UXHoH',1209600,'2019-11-06 14:33:38',1,NULL),('6HAQ8CqooH2mf2tf7fAMJmuSSMDOWM4hgrBuL0R4mBLb0ZLk5EnWycJPGRCB77Ku',1209600,'2019-11-06 14:16:53',1,NULL),('7QJvHBdgNY9TkqVUKX1c5s2NcAjm6JIXzFqwMqMVpf6MqzGxnBOzIy0e4aelS8b4',1209600,'2019-11-06 07:20:37',1,NULL),('8KiUhVc4178gM9GuTMIpGByAjhhVMaczeyeHf0n8C4E3Ru85Tn5EtE2J3Kj3Z740',1209600,'2019-11-06 14:10:01',1,NULL),('AupQdpunSrVvzyDOGOGcLqcw02axZKcyfEv4eQXDBs9ZVsl2uLmYZPQE5xnvggHh',1209600,'2019-11-10 10:07:08',1,NULL),('b6eMzXT8fqli37AWzvorexxGKqX7MWC3dza5bXnYu6FRtHL9m3K1duRCHSIWPsJH',1209600,'2019-11-10 10:10:18',1,NULL),('BAOJpjbAelG8qCnymi9ScXihl1vgIGZ2TmPQbmpNXP5Hvej4rIVzHsfnA7Ed2ASZ',1209600,'2019-11-06 14:08:47',1,NULL),('c7eXCfN9Qnh6Mq8XWSz2MNts4rUebxQxJH4VenBNytydffLxSD4c0JqOkQ4BBn1E',1209600,'2019-11-11 23:21:28',3,NULL),('cj268hxuGLGJyy4GbLJVLhcoLuNdxVwQrFiaQaY5zkQ6tQ6zU1tb9orGJGIY4hxY',1209600,'2019-11-11 22:11:37',1,NULL),('cz9n481hhEiQy3GQ99wyuIpmRlHXTn2tO3UDbVUWA0xywM0rqWixKPv1t8zNvYpf',1209600,'2019-11-10 10:29:41',1,NULL),('D1TKClDDkWkP3YTAT2ux0RNeUHGvxtAdBlxPu21CFDDj2gnjcOFL2QUjIilwGlte',1209600,'2019-11-10 12:28:00',1,NULL),('D6jG0g9xBfTDRvg9Qik29AVUZXARwAWtRlgWn2EQbjq4b20GzZAoVi6gysRTwNFS',1209600,'2019-11-10 12:34:49',1,NULL),('dgtERuJN9B1TmqhUihuNN1fecMO5tG1E3ipPhPnlmDACCzQiOkOFiwkz1YGJ7Ayw',1209600,'2019-11-06 13:30:21',1,NULL),('dOhZGxbccKKB7TjqLZUad9rcFWzeluMUOeEczhDzGk8BuKJ5ZEZYqqXeLFoMameS',1209600,'2019-11-06 13:26:25',1,NULL),('eaYKPHicRhu3wDUPGDtR6GWDGP7pkt09zKI9yWoiZ2t7AgDddPlcg8vpRV6XUPMH',1209600,'2019-11-11 22:56:37',3,NULL),('EVwjlYSZby1cjMH5Lwr9Mew9X54oLuE02VN86J5DL5K8CkkWxodBi20eARbqOgfX',1209600,'2019-11-10 10:18:33',1,NULL),('FmljJPSyuH5ERRhE1jeFB7nsyE3sbIaoKAbH0IFlNNKOyu5nG0DDnBgpFHxPOGxC',1209600,'2019-11-11 15:03:36',1,NULL),('Fn256uqNaLDoYQBBN3J0QTGqFPouQSC2MSFgEBuGqGRMeQJoXz31mKwV1FSGNOvz',1209600,'2019-11-06 14:16:56',1,NULL),('fpTDun9idlMO2bJFfu17vmWhtVWOU1RHaVQ2ifqZSVrgcims7DQrauIFu557t4Ly',1209600,'2019-11-10 10:19:08',1,NULL),('GdtRcbRrNMbhSDfSN0DiFlcJpqou4bnljjSkant5Ywnf4GSwqWhxxwheH37Grbrj',1209600,'2019-11-11 23:17:07',3,NULL),('ghlnu8KFjN9PL1uAvAsi7pczzUEWj8qwBHktWZfhgg122LYYQeVr0tJnbWmLbAMn',1209600,'2019-11-06 14:16:57',1,NULL),('gt8YS3t0RpLBlCFkqjShmuE8pmBj4MrTovDEW3p1eI75aG5e0JbRL07Nq49PfwnE',1209600,'2019-11-06 14:00:53',1,NULL),('GZL1yaLm53kgHaAothPqObWnJn1Xum8RBYwF4MMU9db5Ad6Whm3QiiwhxHfztuCg',1209600,'2019-11-06 14:07:48',1,NULL),('h0e6esjLwBt1XYTU0mX2U5pD818AzRdKfYc5PGdODsLyQQg6VcVj0VnUchvAKNF2',1209600,'2019-11-06 14:13:50',1,NULL),('H7ezGxWVV12T3QeB7uz3eYzA7FKuK8U0dIOTtVaPFJgllSAkuFPacyquFIdIHoyH',1209600,'2019-11-10 10:40:15',1,NULL),('HoegFgBWYbzS9MprkGwwCNCr5F9hafQrCw0IvcTnzgbzpj45rOiyIpRotqKQTN1G',1209600,'2019-11-06 14:16:59',1,NULL),('HSoum8n8OW5lizjXZe1n1pFTcqYBNaE2tZKLeHquoV0stjDOsKAYpOIAIExvCY8E',1209600,'2019-11-11 23:40:47',1,NULL),('ID1n3B1qrKU5oWYbSPlZRcSlf0yZXgaAmdHQLssmsOMkAEUQv13XLyNAM8l6vtVO',1209600,'2019-11-06 13:57:09',1,NULL),('iDR2LSRdW9jc8PgATxwsPGaygC0FKD8SCnbkOc4XMKkv0R1Ht7hoTB6Ca7NAkwnX',1209600,'2019-11-06 14:05:26',1,NULL),('iq9bDh2T1XAHcCF3CCXAhHxotBfRnFJflixTwDm7znkgrfpsZgUjUFvxQnQZDaiO',1209600,'2019-11-06 14:16:55',1,NULL),('IrAzmmiLUcE93i1NHJ1gfFj4bFalKwINCvhtr0e22yBaK0IHjFw7bEaTnzZkVLm2',1209600,'2019-11-10 12:29:22',1,NULL),('KevuOHc2yCDbiI2sl2og0SSOulMpftTfDmRHLecLfIG8E4fzRdeuOw0lo5mFZBKF',1209600,'2019-11-06 14:35:55',1,NULL),('KJV6YKVAncHag7e27oKofaaIDYCW2CkTaKdbAkOUW9eW1gEfXRYuMWO1aAYoumLX',1209600,'2019-11-06 14:16:58',1,NULL),('KVBvRHj9E8OwRg2lzXTIbbNmNBUCzNCWiNTEzl7DzcB8v5TiIF5amdzAo1wA1E2Q',1209600,'2019-10-24 11:29:23',1,NULL),('lOFKYeBJFrPB3kfCKfNZiKjcdlHkpCkSDFfeDHbPl8h5aOsoGr5cGFY3goTxVDzi',1209600,'2019-11-06 13:53:37',1,NULL),('nGsET4JlQanhRwtmlB9Uiz3MeR3CBhYoqhY1gE7wF0u2OSeXDXWE52eQhoFYHrBZ',1209600,'2019-11-06 13:02:28',1,NULL),('NKt3CQMOfkeKitg8MzUlTuF9kKs4I2GFOHGXY9cDH3BCfteFuEHD4jEzq2G1zM0U',1209600,'2019-11-11 15:08:20',1,NULL),('ojSXjJd7xqVK0KUdAcHCCa8WTZPdovNgi5FmcFajX25ZNxNZvZI5rnwbDmntSQEV',1209600,'2019-11-10 12:38:08',1,NULL),('Os6lo9rXEVc1dFHSQebIR6BhbrdYiLN7F6WlLEKNMnyxfONZnXRwG1Murun1Xu4V',1209600,'2019-11-10 10:15:49',1,NULL),('PfqhmZqgrWB2HxU9HxDYw2w1p3aEChNcCIENSYr8iuo90sixFGCdeIHZLt4AHGB6',1209600,'2019-11-06 14:16:58',1,NULL),('pi910Fmsshgm1ZfWCJhpsX6JXHDPSj263YG0yWRRnBOajtiNP8mOzFWNqlWfxDrF',1209600,'2019-11-10 12:35:21',1,NULL),('PZGBjEwwhZoAcHjYN83dKR4WI7oRNoAGkMr2aj997ISILuGAtJtnBsapeZSHLvpH',1209600,'2019-11-06 13:06:47',1,NULL),('Q66Hl91lyVRBO3bFRnFcQJ7YnyHuV37u3uzvdd1vfWTm7mFaA4jCo673z03ZCv3j',1209600,'2019-10-02 08:47:45',1,NULL),('qEoMGrAGeA4HdxHPqZ24ozfQb31TpEzIPQDQzjXwNFvnqhmFWTGWUDGTEOS2Pfz1',1209600,'2019-11-10 10:17:38',1,NULL),('QK3CIfu9pB6chlMpJBsU3ezlLONUiHeUPs0qCrSOwERAkN6ynjSED1ELysDR96L3',1209600,'2019-11-06 13:01:40',1,NULL),('RfJfZrQOCbpOagfNOFBiYMbMGBoEcwkVue5V7JIAfm9wbtTBSaK2nC8RZ5U2Ht4U',1209600,'2019-11-06 14:31:48',1,NULL),('S91QTeZ9xN0B8Zmd8nAM8PI9ganTjNdcg0bCllIo9EIpRVux6xfPpQn2RfpNggTP',1209600,'2019-11-11 13:27:42',1,NULL),('s9vtXB3vOPgshiz73QDWvBLljQYF3KuUE2wbmykEj2nNeMmIthbXmu85MUKfNmSx',1209600,'2019-11-06 14:04:42',1,NULL),('sxfTZkNB4rVfwJyAbi0RCAieDpOgz55XrDYqsPmfKnMiBxwsRngmTWCxrllpgSD1',1209600,'2019-11-06 14:16:57',1,NULL),('TeVvITQ9ZPNpWCfs0QL9f7LlxfN9vhrqYAmyIaO3JW82eLX5bexNbkx8mXLsVy8o',1209600,'2019-11-11 22:56:00',3,NULL),('TOPHp5rcrRIWQ9vUZRuIBDCzPpCYFZOfu4cWUve1Cq8iISX1CDH0mUYvwnNxKkbE',1209600,'2019-11-10 10:16:13',1,NULL),('tyIQQjjYAvC45asrmjfnHdlhn51HJu4IrH6dx7ADsUUbMba0s3frJf2shA8SqAS2',1209600,'2019-11-06 14:16:40',1,NULL),('U4ybeKrcGGWJ9fyqMIwFtQz0McQQ3z8mTr7iY6efVQ4HUdmUvl0JAB960yu0VDaI',1209600,'2019-11-10 12:42:55',1,NULL),('V73Mk63FRkI2rJAY9pEpmQv4RIPJ9IqT8EiPkGwYBJQFvk1tQ7tlExxeWy5nkoJf',1209600,'2019-11-06 14:15:28',1,NULL),('v91tysnMBpQNRiJR5kVGflB628MFzrGEhl7R26aQHKGZl4jufTGWok9RCBjmEioO',1209600,'2019-11-06 13:54:34',1,NULL),('vA2DYeRDwpqQj60jguaIlyPqHBskyqeCdWxRtceCnd78JXgYD9PdUtIhl0O80c9n',1209600,'2019-11-11 22:23:04',1,NULL),('vBUYwLKOH4B34SXFoOgzGTbWAPn0WbPPbYz8wxxnImRSWbFaQpeRfTmfo0tu5yXz',1209600,'2019-11-10 10:11:16',1,NULL),('vPPFdjPJvY3RvdYRmWL8yXVH5Q4I3kpEZ8VOWOHkqkj3Wf5g0FJQbNamPqcYBQiI',1209600,'2019-11-06 07:22:59',1,NULL),('w1EWmYv8pslJymzkBxrguFsNvdD0UD8OmNiwDAcuSlZbWTffr7WjVdtx7dheWNd9',1209600,'2019-11-10 10:14:57',1,NULL),('wq77EKKHvnCP8R8aSDb04fGrLNUHlYqRG4h8yRE7RHii1f7BH1vVEWisWezJJEDW',1209600,'2019-11-06 14:32:15',1,NULL),('WUkXVMXNdpHhwF1Sm3DcbrA7pfO6LxllXArnnPx6ciE4ytL3La1X7YwWm6u1DbHG',1209600,'2019-11-06 14:16:58',1,NULL),('xDgYCzXZOMoDxdBDG12fZiPezslwUSX6s8itreEP4BxOHtEI1ykGrrFilV3Ae4FH',1209600,'2019-11-06 13:31:15',1,NULL),('xysZz4ZWn2Sbk0AG4OiRShKQUPpOVO7OnFHNJehvfl3EFg2JqnyqOzhw1f4Jorry',1209600,'2019-11-10 10:43:05',1,NULL),('yi13z6FUHmvoZwTEPNKqAJH65NHwHBMHjD4Pku9WA2E4XAkuia0gcvgWr6Fq2FRE',1209600,'2019-11-11 22:52:49',1,NULL),('ZgYDfHCb0Scgjk7qlWKSebZDJhHE2glrPbvdvG5Eaz8p1ODaDLyTQb9SLibM08DL',1209600,'2019-11-10 10:15:08',1,NULL),('ZULQRipk3RqOVBhmI4ijMWxCmjPsboTxdkUgqNZ2uCEjn0kjq8AN7Pv4Y1Ci1WMn',1209600,'2019-11-06 13:55:12',1,NULL);
/*!40000 ALTER TABLE `AccessToken` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `CustomUser`
--

DROP TABLE IF EXISTS `CustomUser`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `CustomUser` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `realm` varchar(512) DEFAULT NULL,
  `username` varchar(512) DEFAULT NULL,
  `password` varchar(512) DEFAULT NULL,
  `credentials` text,
  `email` varchar(512) NOT NULL,
  `emailVerified` tinyint(1) DEFAULT NULL,
  `verificationToken` varchar(512) DEFAULT NULL,
  `mainImageId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CustomUser`
--

LOCK TABLES `CustomUser` WRITE;
/*!40000 ALTER TABLE `CustomUser` DISABLE KEYS */;
INSERT INTO `CustomUser` VALUES (1,NULL,'admin','$2a$10$1rrCdKsNzhQ4.qOg9RkgheTx53Ihamn.39o1ojj8rcmbs97j.UDr2',NULL,'admin@carmel6000.amitnet.org',1,NULL,NULL),(3,NULL,'batz','$2a$10$sUh3o7.rJ4qTsom3TqLmC.BT3Y4Sn4S.CYlWB69k8bCc8fNB1pCqa',NULL,'batz@carmel6000.amitnet.org',1,NULL,NULL);
/*!40000 ALTER TABLE `CustomUser` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Files`
--

DROP TABLE IF EXISTS `Files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Files` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(200) DEFAULT NULL,
  `description` text,
  `created` datetime DEFAULT NULL,
  `format` enum('docx','doc','pdf','mp3','wav') CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `modified` datetime DEFAULT NULL,
  `owner` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Files`
--

LOCK TABLES `Files` WRITE;
/*!40000 ALTER TABLE `Files` DISABLE KEYS */;
INSERT INTO `Files` VALUES (8,NULL,NULL,NULL,'docx',NULL,NULL,NULL),(9,NULL,NULL,NULL,'docx',NULL,NULL,1),(10,NULL,NULL,NULL,'docx',NULL,NULL,NULL),(11,NULL,NULL,NULL,'docx',NULL,NULL,NULL),(12,NULL,NULL,NULL,'docx',NULL,NULL,NULL),(13,NULL,NULL,NULL,'docx',NULL,NULL,NULL),(14,NULL,NULL,NULL,'docx',NULL,NULL,NULL),(15,NULL,NULL,NULL,'docx',NULL,NULL,NULL),(16,NULL,NULL,NULL,'docx',NULL,NULL,NULL),(17,NULL,NULL,NULL,'docx',NULL,NULL,NULL),(18,NULL,NULL,NULL,'docx',NULL,NULL,NULL),(19,NULL,NULL,NULL,'docx',NULL,NULL,NULL),(20,NULL,NULL,NULL,'docx',NULL,NULL,NULL),(21,NULL,NULL,NULL,'docx',NULL,NULL,NULL),(22,NULL,NULL,NULL,'docx',NULL,NULL,NULL),(23,NULL,NULL,NULL,'docx',NULL,NULL,NULL),(24,NULL,NULL,NULL,'docx',NULL,NULL,NULL),(25,NULL,NULL,NULL,'docx',NULL,NULL,NULL);
/*!40000 ALTER TABLE `Files` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Images`
--

DROP TABLE IF EXISTS `Images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Images` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(200) CHARACTER SET utf8 DEFAULT NULL,
  `description` text CHARACTER SET utf8,
  `created` datetime DEFAULT NULL,
  `format` enum('png','jpg','jpeg','gif') CHARACTER SET utf8 DEFAULT NULL,
  `modified` datetime DEFAULT NULL,
  `category` varchar(100) CHARACTER SET utf8 DEFAULT NULL,
  `owner` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Images`
--

LOCK TABLES `Images` WRITE;
/*!40000 ALTER TABLE `Images` DISABLE KEYS */;
INSERT INTO `Images` VALUES (1,'Labrador','labrador icon',NULL,'png','2019-02-28 11:24:33','icons',2),(2,'Like','like icon',NULL,'png','2019-02-28 11:28:18','icons',1),(3,'Birds flying','Birds by Reut',NULL,'jpg','2019-02-28 13:16:01','view',1);
/*!40000 ALTER TABLE `Images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Notification`
--

DROP TABLE IF EXISTS `Notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Notification` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `htmlMsg` text COLLATE utf8_unicode_ci,
  `created` datetime DEFAULT NULL,
  `modified` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Notification`
--

LOCK TABLES `Notification` WRITE;
/*!40000 ALTER TABLE `Notification` DISABLE KEYS */;
/*!40000 ALTER TABLE `Notification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `NotificationsMap`
--

DROP TABLE IF EXISTS `NotificationsMap`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `NotificationsMap` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `notification_id` int(11) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `fetched` tinyint(1) DEFAULT '0',
  `modified` datetime DEFAULT NULL,
  `user_new_notification_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notification_id` (`notification_id`),
  CONSTRAINT `NotificationsMap_ibfk_1` FOREIGN KEY (`notification_id`) REFERENCES `Notification` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `NotificationsMap`
--

LOCK TABLES `NotificationsMap` WRITE;
/*!40000 ALTER TABLE `NotificationsMap` DISABLE KEYS */;
/*!40000 ALTER TABLE `NotificationsMap` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Role`
--

DROP TABLE IF EXISTS `Role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Role` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(512) NOT NULL,
  `description` varchar(512) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `modified` datetime DEFAULT NULL,
  `roleKey` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Role`
--

LOCK TABLES `Role` WRITE;
/*!40000 ALTER TABLE `Role` DISABLE KEYS */;
INSERT INTO `Role` VALUES (1,'SIMPLEUSER',NULL,NULL,NULL,'miremerijfgivn238svnsdfsdf'),(2,'ADMIN',NULL,NULL,NULL,'gmrkipgm$2300femkFSFKeo375'),(3,'SUPERADMIN',NULL,NULL,NULL,'spf%#kfpoFFAa2234adAA244asZZv');
/*!40000 ALTER TABLE `Role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `RoleMapping`
--

DROP TABLE IF EXISTS `RoleMapping`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `RoleMapping` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `principalType` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `principalId` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `roleId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `principalId` (`principalId`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `RoleMapping`
--

LOCK TABLES `RoleMapping` WRITE;
/*!40000 ALTER TABLE `RoleMapping` DISABLE KEYS */;
INSERT INTO `RoleMapping` VALUES (1,'ROLE','1',3),(2,'ROLE','3',1);
/*!40000 ALTER TABLE `RoleMapping` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Schools`
--

DROP TABLE IF EXISTS `Schools`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Schools` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `school_name` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `modified` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Schools`
--

LOCK TABLES `Schools` WRITE;
/*!40000 ALTER TABLE `Schools` DISABLE KEYS */;
/*!40000 ALTER TABLE `Schools` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `SchoolsGames`
--

DROP TABLE IF EXISTS `SchoolsGames`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `SchoolsGames` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `school_id` int(11) DEFAULT NULL,
  `game_id` int(11) unsigned DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `modified` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `school_id` (`school_id`),
  KEY `game_id` (`game_id`),
  CONSTRAINT `SchoolsGames_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `Schools` (`id`),
  CONSTRAINT `SchoolsGames_ibfk_2` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SchoolsGames`
--

LOCK TABLES `SchoolsGames` WRITE;
/*!40000 ALTER TABLE `SchoolsGames` DISABLE KEYS */;
/*!40000 ALTER TABLE `SchoolsGames` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `User`
--

DROP TABLE IF EXISTS `User`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `User` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `realm` varchar(512) DEFAULT NULL,
  `username` varchar(512) DEFAULT NULL,
  `password` varchar(512) NOT NULL,
  `credentials` text,
  `challenges` text,
  `email` varchar(512) NOT NULL,
  `emailVerified` tinyint(1) DEFAULT NULL,
  `verificationToken` varchar(512) DEFAULT NULL,
  `status` varchar(512) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `lastUpdated` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `User`
--

LOCK TABLES `User` WRITE;
/*!40000 ALTER TABLE `User` DISABLE KEYS */;
/*!40000 ALTER TABLE `User` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `games`
--

DROP TABLE IF EXISTS `games`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `games` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `owner_id` int(11) NOT NULL,
  `title` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `played_num` int(11) unsigned NOT NULL DEFAULT '0',
  `description` text COLLATE utf8mb4_unicode_ci,
  `school_name` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `created` datetime DEFAULT CURRENT_TIMESTAMP,
  `published` datetime DEFAULT NULL,
  `img_id` int(11) unsigned DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `owner_id` (`owner_id`),
  KEY `img_id` (`img_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `games`
--

LOCK TABLES `games` WRITE;
/*!40000 ALTER TABLE `games` DISABLE KEYS */;
INSERT INTO `games` VALUES (1,1,'An amazing example!!',6,'hey, im an example for you to see loopback. i have an image form the server!','carmel6000','2019-02-28 13:52:13','2019-02-28 13:52:13',2);
/*!40000 ALTER TABLE `games` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2019-11-12  1:48:39
