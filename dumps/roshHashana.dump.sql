-- MySQL dump 10.13  Distrib 5.7.31, for Linux (x86_64)
--
-- Host: localhost    Database: roshHashana
-- ------------------------------------------------------
-- Server version	5.7.31-0ubuntu0.18.04.1

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
INSERT INTO `AccessToken` VALUES ('6bEGGD5Ss8L3ZwuXoiIrhWsz4b8Vf3z0UBi1D7awiARnrBSovcZYOeEZ4oVary2g',18000,'2020-08-16 14:52:12',24,NULL),('768IGyH77nUwlK8etH3fK7ZLcWpQlF4FkAjOEHUR4KVT8TAG3wyVzgIUbXOg3HRq',18000,'2020-08-16 14:51:12',24,NULL),('nid7b0FrJFa63Yeei7Cql8QTO4EajOc88nsMli5cMmGkeCZRIpWRMx6Nb4lLY2gh',18000,'2020-08-16 13:52:15',24,NULL);
/*!40000 ALTER TABLE `AccessToken` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `CustomUser`
--

DROP TABLE IF EXISTS `CustomUser`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `CustomUser` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `realm` varchar(512) DEFAULT NULL,
  `username` varchar(512) DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `keyId` int(11) DEFAULT NULL,
  `comments` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `password` varchar(512) DEFAULT NULL,
  `credentials` text,
  `email` varchar(512) DEFAULT NULL,
  `emailVerified` tinyint(1) DEFAULT NULL,
  `verificationToken` varchar(512) DEFAULT NULL,
  `mainImageId` int(11) DEFAULT NULL,
  `address` varchar(400) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `lng` varchar(255) DEFAULT NULL,
  `lat` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CustomUser`
--

LOCK TABLES `CustomUser` WRITE;
/*!40000 ALTER TABLE `CustomUser` DISABLE KEYS */;
INSERT INTO `CustomUser` VALUES (24,NULL,'maayanthebestadmin','maayan',NULL,NULL,'$2a$10$QrQVMVwGtVcnyTiF5w2t0uam0b2cZ/.zKJi3oXCaJFxg2dFXGSZd.',NULL,'admin@gmail.com',NULL,'ea7f0759e4ae1df6d3a34bbee3bfe4254796f0e50c160fdd741f9dba7cb5b0faab0f1c0073924978a8cdf9b6e488300ec7755d54dd2dc160643c14e93112e4ac',NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `CustomUser` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Files`
--

DROP TABLE IF EXISTS `Files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Files` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(200) DEFAULT NULL,
  `description` text,
  `created` datetime DEFAULT NULL,
  `format` enum('docx','doc','pdf','mp3','wav') CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `modified` datetime DEFAULT NULL,
  `owner` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Files`
--

LOCK TABLES `Files` WRITE;
/*!40000 ALTER TABLE `Files` DISABLE KEYS */;
/*!40000 ALTER TABLE `Files` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Images`
--

DROP TABLE IF EXISTS `Images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Images` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(200) CHARACTER SET utf8 DEFAULT NULL,
  `description` text CHARACTER SET utf8,
  `created` datetime DEFAULT NULL,
  `format` enum('png','jpg','jpeg','gif') CHARACTER SET utf8 DEFAULT NULL,
  `modified` datetime DEFAULT NULL,
  `category` varchar(100) CHARACTER SET utf8 DEFAULT NULL,
  `owner` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Images`
--

LOCK TABLES `Images` WRITE;
/*!40000 ALTER TABLE `Images` DISABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Role`
--

LOCK TABLES `Role` WRITE;
/*!40000 ALTER TABLE `Role` DISABLE KEYS */;
INSERT INTO `Role` VALUES (1,'ISOLATED',NULL,NULL,NULL,'miremerijfgivn238svnsdfsdf'),(2,'SHOFARBLOWER',NULL,NULL,NULL,'gmrkipgm$2300femkFSFKeo375'),(3,'GENERALUSER',NULL,NULL,NULL,'spf%#kfpoFFAa2234adAA244asZZv'),(4,'ADMIN',NULL,NULL,NULL,'dsfdsgfest4e534fdfsdkfdsfsfewr4');
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
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `RoleMapping`
--

LOCK TABLES `RoleMapping` WRITE;
/*!40000 ALTER TABLE `RoleMapping` DISABLE KEYS */;
INSERT INTO `RoleMapping` VALUES (24,'USER','24',4);
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
  `game_id` int(10) unsigned DEFAULT NULL,
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
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `owner_id` int(11) NOT NULL,
  `title` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `played_num` int(10) unsigned NOT NULL DEFAULT '0',
  `description` text COLLATE utf8mb4_unicode_ci,
  `school_name` varchar(100) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `created` datetime DEFAULT CURRENT_TIMESTAMP,
  `published` datetime DEFAULT NULL,
  `img_id` int(10) unsigned DEFAULT '0',
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
/*!40000 ALTER TABLE `games` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `isolated`
--

DROP TABLE IF EXISTS `isolated`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `isolated` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userIsolatedId` int(10) unsigned NOT NULL,
  `public_phone` tinyint(3) unsigned DEFAULT '0',
  `public_meeting` tinyint(3) unsigned DEFAULT '0',
  `meeting_time` datetime DEFAULT NULL,
  `blowerMeetingId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `isolated`
--

LOCK TABLES `isolated` WRITE;
/*!40000 ALTER TABLE `isolated` DISABLE KEYS */;
/*!40000 ALTER TABLE `isolated` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `keys`
--

DROP TABLE IF EXISTS `keys`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `keys` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `key` int(11) NOT NULL,
  `date_key` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=83 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `keys`
--

LOCK TABLES `keys` WRITE;
/*!40000 ALTER TABLE `keys` DISABLE KEYS */;
/*!40000 ALTER TABLE `keys` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `records_permissions`
--

DROP TABLE IF EXISTS `records_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `records_permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `model` varchar(100) DEFAULT NULL,
  `recordId` int(10) unsigned DEFAULT NULL,
  `principalType` enum('$OWNER','ROLE','USER') DEFAULT NULL,
  `principalId` varchar(100) DEFAULT NULL,
  `permission` enum('ALLOW','DENY') DEFAULT 'DENY',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `records_permissions`
--

LOCK TABLES `records_permissions` WRITE;
/*!40000 ALTER TABLE `records_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `records_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shofar_blower`
--

DROP TABLE IF EXISTS `shofar_blower`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `shofar_blower` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userBlowerId` int(10) unsigned NOT NULL,
  `confirm` tinyint(3) unsigned DEFAULT '0',
  `can_blow_x_times` int(10) unsigned NOT NULL,
  `volunteering_start_time` datetime NOT NULL,
  `volunteering_max_time` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shofar_blower`
--

LOCK TABLES `shofar_blower` WRITE;
/*!40000 ALTER TABLE `shofar_blower` DISABLE KEYS */;
/*!40000 ALTER TABLE `shofar_blower` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shofar_blower_pub`
--

DROP TABLE IF EXISTS `shofar_blower_pub`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `shofar_blower_pub` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `comments` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `start_time` datetime DEFAULT NULL,
  `blowerId` int(10) unsigned DEFAULT NULL,
  `constMeeting` tinyint(3) unsigned DEFAULT '0',
  `address` varchar(400) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `lng` varchar(255) DEFAULT NULL,
  `lat` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shofar_blower_pub`
--

LOCK TABLES `shofar_blower_pub` WRITE;
/*!40000 ALTER TABLE `shofar_blower_pub` DISABLE KEYS */;
/*!40000 ALTER TABLE `shofar_blower_pub` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_archive`
--

DROP TABLE IF EXISTS `users_archive`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users_archive` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `name` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `username` varchar(512) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_archive`
--

LOCK TABLES `users_archive` WRITE;
/*!40000 ALTER TABLE `users_archive` DISABLE KEYS */;
/*!40000 ALTER TABLE `users_archive` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-08-16 17:58:08
