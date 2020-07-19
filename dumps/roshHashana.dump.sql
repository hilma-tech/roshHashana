-- MySQL dump 10.13  Distrib 5.7.30, for Linux (x86_64)
--
-- Host: localhost    Database: roshHashana
-- ------------------------------------------------------
-- Server version	5.7.30-0ubuntu0.18.04.1

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
  `name` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `keyId` int(11) DEFAULT NULL,
  `cityId` int(11) DEFAULT NULL,
  `street` varchar(50) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `appartment` varchar(50) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `comments` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `password` varchar(512) DEFAULT NULL,
  `credentials` text,
  `email` varchar(512) DEFAULT NULL,
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
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `RoleMapping`
--

LOCK TABLES `RoleMapping` WRITE;
/*!40000 ALTER TABLE `RoleMapping` DISABLE KEYS */;
INSERT INTO `RoleMapping` VALUES (2,'User','3',1),(3,'User','1',3);
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
-- Table structure for table `city`
--

DROP TABLE IF EXISTS `city`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `city` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `name_en` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1272 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `city`
--

LOCK TABLES `city` WRITE;
/*!40000 ALTER TABLE `city` DISABLE KEYS */;
INSERT INTO `city` VALUES (1,'גמזו','GIMZO'),(2,'ירושלים','JERUSALEM'),(4,'אבו ג\'ווייעד ','ABU JUWEI\'ID'),(5,'אבו גוש','ABU GHOSH'),(6,'אבו סנאן','ABU SINAN'),(7,'אבו סריחאן ','ABU SUREIHAN'),(8,'אבו עבדון ','ABU  ABDUN'),(9,'אבו עמאר ','ABU  AMMAR'),(10,'אבו עמרה ','ABU  AMRE'),(11,'אבו קורינאת ','ABU QUREINAT'),(12,'אבו רובייעה ','ABU RUBEI\'A'),(13,'אבו רוקייק ','ABU RUQAYYEQ'),(14,'אבו תלול','ABU TULUL'),(15,'אבטין','IBTIN'),(16,'אבטליון','AVTALYON'),(17,'אביאל','AVI\'EL'),(18,'אביבים','AVIVIM'),(19,'אביגדור','AVIGEDOR'),(20,'אביחיל','AVIHAYIL'),(21,'אביטל','AVITAL'),(22,'אביעזר','AVI\'EZER'),(23,'אבירים','ABBIRIM'),(24,'אבן יהודה','EVEN YEHUDA'),(25,'אבן מנחם','EVEN MENAHEM'),(26,'אבן ספיר','EVEN SAPPIR'),(27,'אבן שמואל','EVEN SHEMU\'EL'),(28,'אבני איתן','AVNE ETAN'),(29,'אבני חפץ','AVNE HEFEZ'),(30,'אבנת','AVENAT'),(31,'אבשלום','AVSHALOM'),(32,'אדורה','ADORA'),(33,'אדירים','ADDIRIM'),(34,'אדמית','ADAMIT'),(35,'אדרת','ADDERET'),(36,'אודים','UDIM'),(37,'אודם','ODEM'),(38,'אוהד','OHAD'),(39,'אום אל-פחם','UMM AL-FAHM'),(40,'אום אל-קוטוף','UMM AL-QUTUF'),(41,'אום בטין','UMM BATIN'),(42,'אומן','OMEN'),(43,'אומץ','OMEZ'),(44,'אופקים','OFAQIM'),(45,'אור הגנוז','OR HAGANUZ'),(46,'אור הנר','OR HANER'),(47,'אור יהודה','OR YEHUDA'),(48,'אור עקיבא','OR AQIVA'),(49,'אורה','ORA'),(50,'אורות','OROT'),(51,'אורטל','ORTAL'),(52,'אורים','URIM'),(53,'אורנים','ORANIM'),(54,'אורנית','ORANIT'),(55,'אושה','USHA'),(56,'אזור','AZOR'),(57,'אחווה','AHAWA'),(58,'אחוזם','AHUZZAM'),(59,'אחוזת ברק','AHUZZAT BARAQ'),(60,'אחיהוד','AHIHUD'),(61,'אחיטוב','AHITUV'),(62,'אחיסמך','AHISAMAKH'),(63,'אחיעזר','AHI\'EZER'),(64,'אטרש ','ATRASH'),(65,'איבים','IBBIM'),(66,'אייל','EYAL'),(67,'איילת השחר','AYYELET HASHAHAR'),(68,'אילון','ELON'),(69,'אילות','ELOT'),(70,'אילניה','ILANIYYA'),(71,'אילת','ELAT'),(72,'אירוס','IRUS'),(73,'איתמר','ITAMAR'),(74,'איתן','ETAN'),(75,'איתנים','ETANIM'),(76,'אכסאל','IKSAL'),(77,'אל סייד','AL SAYYID'),(78,'אל-עזי','AL-AZY'),(79,'אל-עריאן','AL-ARYAN'),(80,'אל-רום','EL-ROM'),(81,'אלומה','ALUMMA'),(82,'אלומות','ALUMMOT'),(83,'אלון הגליל','ALLON HAGALIL'),(84,'אלון מורה','ELON MORE'),(85,'אלון שבות','ALLON SHEVUT'),(86,'אלוני אבא','ALLONE ABBA'),(87,'אלוני הבשן','ALLONE HABASHAN'),(88,'אלוני יצחק','ALLONE YIZHAQ'),(89,'אלונים','ALLONIM'),(90,'אלי-עד','ELI AL'),(91,'אליאב','ELIAV'),(92,'אליכין','ELYAKHIN'),(93,'אליפז','ELIFAZ'),(94,'אליפלט','ELIFELET'),(95,'אליקים','ELYAQIM'),(96,'אלישיב','ELYASHIV'),(97,'אלישמע','ELISHAMA'),(98,'אלמגור','ALMAGOR'),(99,'אלמוג','ALMOG'),(100,'אלעד','EL\'AD'),(101,'אלעזר','EL\'AZAR'),(102,'אלפי מנשה','ALFE MENASHE'),(103,'אלקוש','ELQOSH'),(104,'אלקנה','ELQANA'),(105,'אמונים','EMUNIM'),(106,'אמירים','AMIRIM'),(107,'אמנון','AMNUN'),(108,'אמציה','AMAZYA'),(109,'אניעם','ANI\'AM'),(110,'אסד ','ASAD'),(111,'אספר','ASEFAR'),(112,'אעבלין','I\'BILLIN'),(113,'אעצם ','A\'SAM'),(114,'אפיניש ','AFEINISH'),(115,'אפיק','AFIQ'),(116,'אפיקים','AFIQIM'),(117,'אפק','AFEQ'),(118,'אפרת','EFRAT'),(119,'ארבל','ARBEL'),(120,'ארגמן','ARGAMAN'),(121,'ארז','EREZ'),(122,'אריאל','ARI\'EL'),(123,'ארסוף','ARSUF'),(124,'אשבול','ESHBOL'),(125,'אשבל','NAHAL ESHBAL'),(126,'אשדוד','ASHDOD'),(127,'אשדות יעקב  ','ASHDOT YA\'AQOV(IHUD)'),(128,'אשדות יעקב  ','ASHDOT YA\'AQOV(ME\'UH'),(129,'אשחר','ESHHAR'),(130,'אשכולות','ESHKOLOT'),(131,'אשל הנשיא','ESHEL HANASI'),(132,'אשלים','ASHALIM'),(133,'אשקלון','ASHQELON'),(134,'אשרת','ASHERAT'),(135,'אשתאול','ESHTA\'OL'),(136,'אתגר','ETGAR'),(137,'באקה אל-גרביה','BAQA AL-GHARBIYYE'),(138,'באר אורה','BE\'ER ORA'),(139,'באר גנים','BEER GANNIM'),(140,'באר טוביה','BE\'ER TUVEYA'),(141,'באר יעקב','BE\'ER YA\'AQOV'),(142,'באר מילכה','BE\'ER MILKA'),(143,'באר שבע','BE\'ER SHEVA'),(144,'בארות יצחק','BE\'EROT YIZHAQ'),(145,'בארותיים','BE\'EROTAYIM'),(146,'בארי','BE\'ERI'),(147,'בוסתן הגליל','BUSTAN HAGALIL'),(148,'בועיינה-נוג\'ידאת','BU\'EINE-NUJEIDAT'),(149,'בוקעאתא','BUQ\'ATA'),(150,'בורגתה','BURGETA'),(151,'בחן','BAHAN'),(152,'בטחה','BITHA'),(153,'ביצרון','BIZZARON'),(154,'ביר אל-מכסור','BIR EL-MAKSUR'),(155,'ביר הדאג\'','BIR HADAGE'),(156,'ביריה','BIRIYYA'),(157,'בית אורן','BET OREN'),(158,'בית אל','BET EL'),(159,'בית אלעזרי','BET EL\'AZARI'),(160,'בית אלפא','BET ALFA'),(161,'בית אריה','BET ARYE'),(162,'בית ברל','BET BERL'),(163,'בית ג\'ן','BEIT JANN'),(164,'בית גוברין','BET GUVRIN'),(165,'בית גמליאל','BET GAMLI\'EL'),(166,'בית דגן','BET DAGAN'),(167,'בית הגדי','BET HAGADDI'),(168,'בית הלוי','BET HALEVI'),(169,'בית הלל','BET HILLEL'),(170,'בית העמק','BET HAEMEQ'),(171,'בית הערבה','BET HAARAVA'),(172,'בית השיטה','BET HASHITTA'),(173,'בית זיד','BET ZEID'),(174,'בית זית','BET ZAYIT'),(175,'בית זרע','BET ZERA'),(176,'בית חורון','BET HORON'),(177,'בית חירות','BET HERUT'),(178,'בית חלקיה','BET HILQIYYA'),(179,'בית חנן','BET HANAN'),(180,'בית חנניה','BET HANANYA'),(181,'בית חשמונאי','BET HASHMONAY'),(182,'בית יהושע','BET YEHOSHUA'),(183,'בית יוסף','BET YOSEF'),(184,'בית ינאי','BET YANNAY'),(185,'בית יצחק-שער חפר','BET YIZHAQ-SH. HEFER'),(186,'בית לחם הגלילית','BET LEHEM HAGELILIT'),(187,'בית מאיר','BET ME\'IR'),(188,'בית נחמיה','BET NEHEMYA'),(189,'בית ניר','BET NIR'),(190,'בית נקופה','BET NEQOFA'),(191,'בית עובד','BET OVED'),(192,'בית עוזיאל','BET UZZI\'EL'),(193,'בית עזרא','BET EZRA'),(194,'בית עריף','BET ARIF'),(195,'בית צבי','BET ZEVI'),(196,'בית קמה','BET QAMA'),(197,'בית קשת','BET QESHET'),(198,'בית רבן','BET RABBAN'),(199,'בית רימון','BET RIMMON'),(200,'בית שאן','BET SHE\'AN'),(201,'בית שמש','BET SHEMESH'),(202,'בית שערים','BET SHE\'ARIM'),(203,'בית שקמה','BET SHIQMA'),(204,'ביתן אהרן','BITAN AHARON'),(205,'ביתר עילית','BETAR ILLIT'),(206,'בלפוריה','BALFURIYYA'),(207,'בן זכאי','BEN ZAKKAY'),(208,'בן עמי','BEN AMMI'),(209,'בן שמן ','BEN SHEMEN(K.NO\'AR)'),(210,'בני ברק','BENE BERAQ'),(211,'בני דקלים','BNE DKALIM'),(212,'בני דרום','BENE DAROM'),(213,'בני דרור','BENE DEROR'),(214,'בני יהודה','BENE YEHUDA'),(215,'בני נצרים','BENE NEZARIM'),(216,'בני עטרות','BENE ATAROT'),(217,'בני עי\"ש','BENE AYISH'),(218,'בני ציון','BENE ZIYYON'),(219,'בני ראם','BENE RE\'EM'),(220,'בניה','BENAYA'),(221,'בנימינה','BINYAMINA'),(222,'בסמ\"ה','BASMA'),(223,'בסמת טבעון','BASMAT TAB\'UN'),(224,'בענה','BI NE'),(225,'בצרה','BAZRA'),(226,'בצת','BEZET'),(227,'בקוע','BEQOA'),(228,'בקעות','BEQA\'OT'),(229,'בר גיורא','BAR GIYYORA'),(230,'בר יוחאי','BAR YOHAY'),(231,'ברוכין','BRUKHIN'),(232,'ברור חיל','BEROR HAYIL'),(233,'ברוש','BEROSH'),(234,'ברכה','BERAKHA'),(235,'ברכיה','BEREKHYA'),(236,'ברעם','BAR\'AM'),(237,'ברק','BARAQ'),(238,'ברקאי','BARQAY'),(239,'ברקן','BARQAN'),(240,'ברקת','BAREQET'),(241,'בת הדר','BAT HADAR'),(242,'בת חן','BAT HEN'),(243,'בת חפר','BAT HEFER'),(244,'בת חצור','BAT HAZOR'),(245,'בת ים','BAT YAM'),(246,'בת עין','BAT AYIN'),(247,'בת שלמה','BAT SHELOMO'),(248,'ג\'דיידה-מכר','JUDEIDE-MAKER'),(249,'ג\'ולס','JULIS'),(250,'ג\'לג\'וליה','JALJULYE'),(251,'ג\'נאביב ','JUNNABIB'),(252,'ג\'סר א-זרקא','JISR AZ-ZARQA'),(253,'ג\'ש','JISH(GUSH HALAV)'),(254,'ג\'ת','JAAT'),(255,'גאולי תימן','GE\'ULE TEMAN'),(256,'גאולים','GE\'ULIM'),(257,'גאליה','GE\'ALYA'),(258,'גבולות','GEVULOT'),(259,'גבים','GEVIM'),(260,'גבע','GEVA'),(261,'גבע בנימין','GEVA BINYAMIN'),(262,'גבע כרמל','GEVA  KARMEL'),(263,'גבעולים','GIV\'OLIM'),(264,'גבעון החדשה','GIV\'ON HAHADASHA'),(265,'גבעות בר','GEVA\'OT BAR'),(266,'גבעת אבני','GIV\'AT AVNI'),(267,'גבעת אלה','GIV\'AT ELA'),(268,'גבעת ברנר','GIV\'AT BRENNER'),(269,'גבעת השלושה','GIV\'AT HASHELOSHA'),(270,'גבעת זאב','GIV\'AT ZE\'EV'),(271,'גבעת ח\"ן','GIV\'AT HEN'),(272,'גבעת חיים ','GIV\'AT HAYYIM(ME\'UHA'),(273,'גבעת יואב','GIV\'AT YO\'AV'),(274,'גבעת יערים','GIV\'AT YE\'ARIM'),(275,'גבעת ישעיהו','GIV\'AT YESHA\'YAHU'),(276,'גבעת כ\"ח','GIV\'AT KOAH'),(277,'גבעת ניל\"י','GIV\'AT NILI'),(278,'גבעת עוז','GIV\'AT OZ'),(279,'גבעת שמואל','GIV\'AT SHEMU\'EL'),(280,'גבעת שמש','GIV\'AT SHEMESH'),(281,'גבעת שפירא','GIV\'AT SHAPPIRA'),(282,'גבעתי','GIV\'ATI'),(283,'גבעתיים','GIV\'ATAYIM'),(284,'גברעם','GEVAR\'AM'),(285,'גבת','GEVAT'),(286,'גדות','GADOT'),(287,'גדיש','GADISH'),(288,'גדעונה','GID\'ONA'),(289,'גדרה','GEDERA'),(290,'גונן','GONEN'),(291,'גורן','GOREN'),(292,'גורנות הגליל','GORNOT HAGALIL'),(293,'גזית','GAZIT'),(294,'גזר','GEZER'),(295,'גיאה','GE\'A'),(296,'גיבתון','GIBBETON'),(297,'גיזו','GIZO'),(298,'גילון','GILON'),(299,'גילת','GILAT'),(300,'גינוסר','GINNOSAR'),(301,'גיניגר','GINNEGAR'),(302,'גינתון','GINNATON'),(303,'גיתה','GITTA'),(304,'גיתית','GITTIT'),(305,'גלאון','GAL\'ON'),(306,'גלגל','GILGAL'),(307,'גליל ים','GELIL YAM'),(308,'גלעד )אבן יצחק(','EVEN YIZHAQ(GAL\'ED)'),(310,'גן הדרום','GAN HADAROM'),(311,'גן השומרון','GAN HASHOMERON'),(312,'גן חיים','GAN HAYYIM'),(313,'גן יאשיה','GAN YOSHIYYA'),(314,'גן יבנה','GAN YAVNE'),(315,'גן נר','GAN NER'),(316,'גן שורק','GAN SOREQ'),(317,'גן שלמה','GAN SHELOMO'),(318,'גן שמואל','GAN SHEMU\'EL'),(319,'גנות','GANNOT'),(320,'גנות הדר','GANNOT HADAR'),(321,'גני הדר','GANNE HADAR'),(322,'גני טל','GANNE TAL'),(323,'גני יוחנן','GANNE YOHANAN'),(324,'גני מודיעין','GANNE MODIIN'),(325,'גני עם','GANNE AM'),(326,'גני תקווה','GANNE TIQWA'),(327,'געש','GA\'ASH'),(328,'געתון','GA\'TON'),(329,'גפן','GEFEN'),(330,'גרופית','GEROFIT'),(331,'גשור','GESHUR'),(332,'גשר','GESHER'),(333,'גשר הזיו','GESHER HAZIW'),(334,'גת ','GAT'),(335,'גת רימון','GAT RIMMON'),(336,'דאלית אל-כרמל','DALIYAT AL-KARMEL'),(337,'דבורה','DEVORA'),(338,'דבוריה','DABBURYE'),(339,'דבירה','DEVIRA'),(340,'דברת','DAVERAT'),(341,'דגניה א\'','DEGANYA ALEF'),(342,'דגניה ב\'','DEGANYA BET'),(343,'דוב\"ב','DOVEV'),(344,'דולב','DOLEV'),(345,'דור','DOR'),(346,'דורות','DOROT'),(347,'דחי','DAHI'),(348,'דייר אל-אסד','DEIR AL-ASAD'),(349,'דייר חנא','DEIR HANNA'),(350,'דייר ראפאת','DEIR RAFAT'),(351,'דימונה','DIMONA'),(352,'דישון','DISHON'),(353,'דליה','DALIYYA'),(354,'דלתון','DALTON'),(355,'דמיידה','DEMEIDE'),(356,'דן','DAN'),(357,'דפנה','DAFNA'),(358,'דקל','DEQEL'),(359,'דריג\'את','DERIG\'AT'),(360,'האון','HAON'),(361,'הבונים','HABONIM'),(362,'הגושרים','HAGOSHERIM'),(363,'הדר עם','HADAR AM'),(364,'הוד השרון','HOD HASHARON'),(365,'הודיה','HODIYYA'),(366,'הודיות','HODAYOT'),(367,'הוואשלה ','HAWASHLA'),(368,'הוזייל ','HUZAYYEL'),(369,'הושעיה','HOSHA\'AYA'),(370,'הזורע','HAZOREA'),(371,'הזורעים','HAZORE\'IM'),(372,'החותרים','HAHOTERIM'),(373,'היוגב','HAYOGEV'),(374,'הילה','HILLA'),(375,'המעפיל','HAMA\'PIL'),(376,'הסוללים','HASOLELIM'),(377,'העוגן','HAOGEN'),(378,'הר אדר','HAR ADAR'),(379,'הר גילה','HAR GILLO'),(380,'הר עמשא','HAR AMASA'),(381,'הראל','HAR\'EL'),(382,'הרדוף','HARDUF'),(383,'הרצליה','HERZELIYYA'),(384,'הררית','HARARIT'),(385,'ורד יריחו','WERED YERIHO'),(386,'ורדון','WARDON'),(387,'זבארגה ','ZABARGA'),(388,'זבדיאל','ZAVDI\'EL'),(389,'זוהר','ZOHAR'),(390,'זיקים','ZIQIM'),(391,'זיתן','ZETAN'),(392,'זכרון יעקב','ZIKHRON YA\'AQOV'),(393,'זכריה','ZEKHARYA'),(394,'זמר','ZEMER'),(395,'זמרת','ZIMRAT'),(396,'זנוח','ZANOAH'),(397,'זרועה','ZERU\'A'),(398,'זרזיר','ZARZIR'),(399,'זרחיה','ZERAHYA'),(400,'ח\'ואלד','KHAWALED'),(401,'ח\'ואלד ','KHAWALED'),(402,'חבצלת השרון','HAVAZZELET HASHARON'),(403,'חבר','HEVER'),(404,'חברון',''),(405,'חגור','HAGOR'),(406,'חגי','HAGGAI'),(407,'חגלה','HOGLA'),(408,'חד-נס','HAD-NES'),(409,'חדיד','HADID'),(410,'חדרה','HADERA'),(411,'חוג\'ייראת ','HUJEIRAT'),(412,'חולדה','HULDA'),(413,'חולון','HOLON'),(414,'חולית','HOLIT'),(415,'חולתה','HULATA'),(416,'חוסן','HOSEN'),(417,'חוסנייה','HUSSNIYYA'),(418,'חופית','HOFIT'),(419,'חוקוק','HUQOQ'),(420,'חורה','HURA'),(421,'חורפיש','HURFEISH'),(422,'חורשים','HORESHIM'),(423,'חזון','HAZON'),(424,'חיבת ציון','HIBBAT ZIYYON'),(425,'חיננית','HINNANIT'),(426,'חיפה','HAIFA'),(427,'חירות','HERUT'),(428,'חלוץ','HALUZ'),(429,'חלץ','HELEZ'),(430,'חמאם','HAMAM'),(431,'חמד','HEMED'),(432,'חמדיה','HAMADYA'),(433,'חמדת','NAHAL HEMDAT'),(434,'חמרה','HAMRA'),(435,'חניאל','HANNI\'EL'),(436,'חניתה','HANITA'),(437,'חנתון','HANNATON'),(438,'חספין','HASPIN'),(439,'חפץ חיים','HAFEZ HAYYIM'),(440,'חפצי-בה','HEFZI-BAH'),(441,'חצב','HAZAV'),(442,'חצבה','HAZEVA'),(443,'חצור הגלילית','HAZOR HAGELILIT'),(444,'חצור-אשדוד','HAZOR-ASHDOD'),(445,'חצר בארותיים','HAZAR BE\'EROTAYIM'),(446,'חצרות חולדה','HAZROT HULDA'),(447,'חצרות יסף','HAZROT YASAF'),(448,'חצרות כ\"ח','HAZROT KOAH'),(449,'חצרים','HAZERIM'),(450,'חרב לאת','HEREV LE\'ET'),(451,'חרוצים','HARUZIM'),(452,'חריש','HARISH'),(453,'חרמש','HERMESH'),(454,'חרשים','HARASHIM'),(455,'חשמונאים','HASHMONA\'IM'),(456,'טבריה','TIBERIAS'),(457,'טובא-זנגריה','TUBA-ZANGARIYYE'),(458,'טורעאן','TUR\'AN'),(459,'טייבה','TAYIBE'),(460,'טייבה )בעמק(','TAYIBE(BAEMEQ)'),(461,'טירה','TIRE'),(462,'טירת יהודה','TIRAT YEHUDA'),(463,'טירת כרמל','TIRAT KARMEL'),(464,'טירת צבי','TIRAT ZEVI'),(465,'טל שחר','TAL SHAHAR'),(466,'טל-אל','TAL-EL'),(467,'טללים','TELALIM'),(468,'טלמון','TALMON'),(469,'טמרה','TAMRA'),(470,'טמרה','TAMRA'),(471,'טנא','TENE'),(472,'טפחות','TEFAHOT'),(473,'יאנוח-ג\'ת','YANUH-JAT'),(474,'יבול','YEVUL'),(475,'יבנאל','YAVNE\'EL'),(476,'יבנה','YAVNE'),(477,'יגור','YAGUR'),(478,'יגל','YAGEL'),(479,'יד בנימין','YAD BINYAMIN'),(480,'יד השמונה','YAD HASHEMONA'),(481,'יד חנה','YAD HANNA'),(482,'יד מרדכי','YAD MORDEKHAY'),(483,'יד נתן','YAD NATAN'),(484,'יד רמב\"ם','YAD RAMBAM'),(485,'ידידה','YEDIDA'),(486,'יהוד-מונוסון','YEHUD-MONOSON'),(487,'יהל','YAHEL'),(488,'יובל','YUVAL'),(489,'יובלים','YUVALIM'),(490,'יודפת','YODEFAT'),(491,'יונתן','YONATAN'),(492,'יושיביה','YOSHIVYA'),(493,'יזרעאל','YIZRE\'EL'),(494,'יחיעם','YEHI\'AM'),(495,'יטבתה','YOTVATA'),(496,'ייט\"ב','YITAV'),(497,'יכיני','YAKHINI'),(498,'ינוב','YANUV'),(499,'ינון','YINNON'),(500,'יסוד המעלה','YESUD HAMA\'ALA'),(501,'יסודות','YESODOT'),(502,'יסעור','YAS\'UR'),(503,'יעד','YA\'AD'),(504,'יעל','YA\'EL'),(505,'יעף','YE\'AF'),(506,'יערה','YA\'ARA'),(507,'יפיע','YAFI'),(508,'יפית','YAFIT'),(509,'יפעת','YIF\'AT'),(510,'יפתח','YIFTAH'),(511,'יצהר','YIZHAR'),(512,'יציץ','YAZIZ'),(513,'יקום','YAQUM'),(514,'יקיר','YAQIR'),(515,'יקנעם ','YOQNE\'AM'),(516,'יקנעם עילית','YOQNE\'AM ILLIT'),(517,'יראון','YIR\'ON'),(518,'ירדנה','YARDENA'),(519,'ירוחם','YEROHAM'),(521,'ירחיב','YARHIV'),(522,'ירכא','YIRKA'),(523,'ירקונה','YARQONA'),(524,'ישע','YESHA'),(525,'ישעי','YISH\'I'),(526,'ישרש','YASHRESH'),(527,'יתד','YATED'),(528,'יתיר',''),(529,'כאבול','KABUL'),(530,'כאוכב אבו אל-היג\'א','KAOKAB ABU AL-HIJA'),(531,'כברי','KABRI'),(532,'כדורי','KADOORIE'),(533,'כדיתה','KADDITA'),(534,'כוכב השחר','KOKHAV HASHAHAR'),(535,'כוכב יאיר','KOKHAV YA\'IR'),(536,'כוכב יעקב','KOKHAV YA\'AQOV'),(537,'כוכב מיכאל','KOKHAV MIKHA\'EL'),(538,'כורזים','KORAZIM'),(539,'כחל','KAHAL'),(540,'כחלה','KOCHLEA'),(541,'כיסופים','KISSUFIM'),(542,'כישור','KISHOR'),(543,'כליל','KELIL'),(544,'כלנית','KALLANIT'),(545,'כמאנה',''),(546,'כמהין','KEMEHIN'),(547,'כמון','KAMMON'),(548,'כנות','KANNOT'),(549,'כנף','KANAF'),(550,'כנרת ','KINNERET(MOSHAVA)'),(551,'כסיפה','KUSEIFE'),(552,'כסלון','KESALON'),(553,'כסרא-סמיע','KISRA-SUMEI'),(554,'כעביה-טבאש-חג\'אג\'רה','KA\'ABIYYE-TABBASH-HA'),(555,'כפר אביב','KEFAR AVIV'),(556,'כפר אדומים','KEFAR ADUMMIM'),(557,'כפר אוריה','KEFAR URIYYA'),(558,'כפר אחים','KEFAR AHIM'),(559,'כפר ביאליק','KEFAR BIALIK'),(560,'כפר ביל\"ו','KEFAR BILU'),(561,'כפר בלום','KEFAR BLUM'),(562,'כפר בן נון','KEFAR BIN NUN'),(563,'כפר ברא','KAFAR BARA'),(564,'כפר ברוך','KEFAR BARUKH'),(565,'כפר גדעון','KEFAR GID\'ON'),(566,'כפר גלים','KEFAR GALLIM'),(567,'כפר גליקסון','KEFAR GLIKSON'),(568,'כפר גלעדי','KEFAR GIL\'ADI'),(569,'כפר דניאל','KEFAR DANIYYEL'),(570,'כפר האורנים','KEFAR HAORANIM'),(571,'כפר החורש','KEFAR HAHORESH'),(572,'כפר המכבי','KEFAR HAMAKKABI'),(573,'כפר הנגיד','KEFAR HANAGID'),(574,'כפר הנוער הדתי','KEFAR HANO\'AR HADATI'),(575,'כפר הנשיא','KEFAR HANASI'),(576,'כפר הס','KEFAR HESS'),(577,'כפר הרא\"ה','KEFAR HARO\'E'),(578,'כפר הרי\"ף','KEFAR HARIF'),(579,'כפר ויתקין','KEFAR VITKIN'),(580,'כפר ורבורג','KEFAR WARBURG'),(581,'כפר ורדים','KEFAR WERADIM'),(582,'כפר זוהרים','KEFAR ZOHARIM'),(583,'כפר זיתים','KEFAR ZETIM'),(584,'כפר חב\"ד','KEFAR HABAD'),(585,'כפר חושן','KEFAR HOSHEN'),(586,'כפר חיטים','KEFAR HITTIM'),(587,'כפר חיים','KEFAR HAYYIM'),(588,'כפר חנניה','KEFAR HANANYA'),(589,'כפר חסידים א\'','KEFAR HASIDIM ALEF'),(590,'כפר חסידים ב\'','KEFAR HASIDIM BET'),(591,'כפר חרוב','KEFAR HARUV'),(592,'כפר טרומן','KEFAR TRUMAN'),(593,'כפר יאסיף','KAFAR YASIF'),(594,'כפר ידידיה','YEDIDYA'),(595,'כפר יהושע','KEFAR YEHOSHUA'),(596,'כפר יונה','KEFAR YONA'),(597,'כפר יחזקאל','KEFAR YEHEZQEL'),(598,'כפר יעבץ','KEFAR YA\'BEZ'),(599,'כפר כמא','KAFAR KAMA'),(600,'כפר כנא','KAFAR KANNA'),(601,'כפר מונש','KEFAR MONASH'),(602,'כפר מימון','KEFAR MAYMON'),(603,'כפר מל\"ל','KEFAR MALAL'),(604,'כפר מנדא','KAFAR MANDA'),(605,'כפר מנחם','KEFAR MENAHEM'),(606,'כפר מסריק','KEFAR MASARYK'),(607,'כפר מצר','KAFAR MISR'),(608,'כפר מרדכי','KEFAR MORDEKHAY'),(609,'כפר נטר','KEFAR NETTER'),(610,'כפר סאלד','KEFAR SZOLD'),(611,'כפר סבא','KEFAR SAVA'),(612,'כפר סילבר','KEFAR SILVER'),(613,'כפר סירקין','KEFAR SIRKIN'),(614,'כפר עבודה','KEFAR AVODA'),(615,'כפר עזה','KEFAR AZZA'),(616,'כפר עציון','KEFAR EZYON'),(617,'כפר פינס','KEFAR PINES'),(618,'כפר קאסם','KAFAR QASEM'),(619,'כפר קיש','KEFAR KISH'),(620,'כפר קרע','KAFAR QARA'),(621,'כפר ראש הנקרה','KEFAR ROSH HANIQRA'),(622,'זרעית','ZAREET'),(623,'כפר רופין','KEFAR RUPPIN'),(624,'כפר רות','KEFAR RUT'),(625,'כפר שמאי','KEFAR SHAMMAY'),(626,'כפר שמואל','KEFAR SHEMU\'EL'),(627,'כפר שמריהו','KEFAR SHEMARYAHU'),(628,'כפר תבור','KEFAR TAVOR'),(629,'כפר תפוח','KEFAR TAPPUAH'),(630,'כרי דשא','KARE DESHE'),(631,'כרכום','KARKOM'),(632,'כרם בן זמרה','KEREM BEN ZIMRA'),(633,'כרם בן שמן','KEREM BEN SHEMEN'),(634,'כרם יבנה','KEREM YAVNE'),(635,'כרם מהר\"ל','KEREM MAHARAL'),(636,'כרם שלום','KEREM SHALOM'),(637,'כרמי יוסף','KARME YOSEF'),(638,'כרמי צור','KARME ZUR'),(639,'כרמי קטיף','KARME QATIF'),(640,'כרמיאל','KARMI\'EL'),(641,'כרמיה','KARMIYYA'),(642,'כרמים','KERAMIM'),(643,'כרמל','KARMEL'),(644,'לא רשום',''),(645,'לבון','LAVON'),(646,'לביא','LAVI'),(647,'לבנים','LIVNIM'),(648,'להב','LAHAV'),(649,'להבות הבשן','LAHAVOT HABASHAN'),(650,'להבות חביבה','LAHAVOT HAVIVA'),(651,'להבים','LEHAVIM'),(652,'לוד','LOD'),(653,'לוזית','LUZIT'),(654,'לוחמי הגיטאות','LOHAME HAGETA\'OT'),(655,'לוטם','LOTEM'),(656,'לוטן','LOTAN'),(657,'לימן','LIMAN'),(658,'לכיש','LAKHISH'),(659,'לפיד','LAPPID'),(660,'לפידות','LAPPIDOT'),(661,'לקיה','LAQYE'),(662,'מאור','MA\'OR'),(663,'מאיר שפיה','ME\'IR SHEFEYA'),(664,'מבוא ביתר','MEVO BETAR'),(665,'מבוא דותן','MEVO DOTAN'),(666,'מבוא חורון','MEVO HORON'),(667,'מבוא חמה','MEVO HAMMA'),(668,'מבוא מודיעים','MEVO MODI\'IM'),(669,'מבואות ים','MEVO\'OT YAM'),(670,'מבואות יריחו','MEVO\'OT YERIHO'),(671,'מבועים','MABBU\'IM'),(672,'מבטחים','MIVTAHIM'),(673,'מבקיעים','MAVQI\'IM'),(674,'מבשרת ציון','MEVASSERET ZIYYON'),(675,'מג\'ד אל-כרום','MAJD AL-KURUM'),(676,'מג\'דל שמס','MAJDAL SHAMS'),(677,'מגאר','MUGHAR'),(678,'מגדים','MEGADIM'),(679,'מגדל','MIGDAL'),(680,'מגדל העמק','MIGDAL HAEMEQ'),(681,'מגדל עוז','MIGDAL OZ'),(682,'מגדלים','MIGDALIM'),(683,'מגידו','MEGIDDO'),(684,'מגל','MAGGAL'),(685,'מגן','MAGEN'),(686,'מגן שאול','MAGEN SHA\'UL'),(687,'מגשימים','MAGSHIMIM'),(688,'מדרך עוז','MIDRAKH OZ'),(689,'מדרשת בן גוריון','MIDRESHET BEN GURION'),(690,'מדרשת רופין','MIDRESHET RUPPIN'),(691,'מודיעין עילית','MODI\'IN ILLIT'),(692,'מודיעין-מכבים-רעות','MODI\'IN-MAKKABBIM-RE'),(693,'מולדת','MOLEDET'),(694,'מוצא עילית','MOZA ILLIT'),(695,'מוקייבלה','MUQEIBLE'),(696,'מורן','MORAN'),(697,'מורשת','MORESHET'),(698,'מזור','MAZOR'),(699,'מזכרת בתיה','MAZKERET BATYA'),(700,'מזרע','MIZRA'),(701,'מזרעה','MAZRA\'A'),(702,'מחולה','MEHOLA'),(703,'מחנה הילה','MAHANE HILLA'),(704,'מחנה טלי','MAHANE TALI'),(705,'מחנה יהודית','MAHANE YEHUDIT'),(706,'מחנה יוכבד','MAHANE YOKHVED'),(707,'מחנה יפה','MAHANE YAFA'),(708,'מחנה יתיר','MAHANE YATTIR'),(709,'מחנה מרים','MAHANE MIRYAM'),(710,'מחנה תל נוף','MAHANE TEL NOF'),(711,'מחניים','MAHANAYIM'),(712,'מחסיה','MAHSEYA'),(713,'מטולה','METULA'),(714,'מטע','MATTA'),(715,'מי עמי','ME AMMI'),(716,'מיטב','METAV'),(717,'מייסר','MEISER'),(718,'מיצר','MEZAR'),(719,'מירב','MERAV'),(720,'מירון','MERON'),(721,'מישר','MESHAR'),(722,'מיתר','METAR'),(723,'מכורה','MEKHORA'),(724,'מכחול','MAKCHUL'),(725,'מכמורת','MIKHMORET'),(726,'מכמנים','MIKHMANNIM'),(727,'מלאה','MELE\'A'),(728,'מלילות','MELILOT'),(729,'מלכיה','MALKIYYA'),(730,'מלכישוע','MALKISHUA'),(731,'מנוחה','MENUHA'),(732,'מנוף','MANOF'),(733,'מנות','MANOT'),(734,'מנחמיה','MENAHEMYA'),(735,'מנרה','MENNARA'),(736,'מנשית זבדה','MANSHIYYET ZABDA'),(737,'מסד','MASSAD'),(738,'מסדה','MASSADA'),(739,'מסילות','MESILLOT'),(740,'מסילת ציון','MESILLAT ZIYYON'),(741,'מסלול','MASLUL'),(742,'מסעדה','MAS\'ADE'),(743,'מסעודין אל-עזאזמה','MAS\'UDIN AL-\'AZAZME'),(744,'מעברות','MA\'BAROT'),(745,'מעגלים','MA\'GALIM'),(746,'מעגן','MA\'AGAN'),(747,'מעגן מיכאל','MA\'AGAN MIKHA\'EL'),(748,'מעוז חיים','MA\'OZ HAYYIM'),(749,'מעון','MA\'ON'),(750,'מעונה','ME\'ONA'),(751,'מעיליא','MI\'ELYA'),(752,'מעין ברוך','MA\'YAN BARUKH'),(753,'מעין צבי','MA\'YAN ZEVI'),(754,'מעלה אדומים','MA\'ALE ADUMMIM'),(755,'מעלה אפרים','MA\'ALE EFRAYIM'),(756,'מעלה גלבוע','MA\'ALE GILBOA'),(757,'מעלה גמלא','MA\'ALE GAMLA'),(758,'מעלה החמישה','MA\'ALE HAHAMISHA'),(759,'מעלה לבונה','MA\'ALE LEVONA'),(760,'מעלה מכמש','MA\'ALE MIKHMAS'),(761,'מעלה עירון','MA\'ALE IRON'),(762,'מעלה עמוס','MA\'ALE AMOS'),(763,'מעלה שומרון','MA\'ALE SHOMERON'),(764,'מעלות-תרשיחא','MA\'ALOT-TARSHIHA'),(765,'מענית','MA\'ANIT'),(766,'מעש','MA\'AS'),(767,'מפלסים','MEFALLESIM'),(768,'מצדות יהודה','MEZADOT YEHUDA'),(769,'מצובה','MAZZUVA'),(770,'מצליח','MAZLIAH'),(771,'מצפה','MIZPA'),(772,'מצפה אבי\"ב','MIZPE AVIV'),(773,'מצפה אילן','MITSPE ILAN'),(774,'מצפה יריחו','MIZPE YERIHO'),(775,'מצפה נטופה','MIZPE NETOFA'),(776,'מצפה רמון','MIZPE RAMON'),(777,'מצפה שלם','MIZPE SHALEM'),(778,'מצר','MEZER'),(779,'מקווה ישראל','MIQWE YISRA\'EL'),(780,'מרגליות','MARGALIYYOT'),(781,'מרום גולן','MEROM GOLAN'),(782,'מרחב עם','MERHAV AM'),(783,'מרחביה ','MERHAVYA'),(784,'מרחביה ','MERHAVYA'),(785,'מרכז שפירא','MERKAZ SHAPPIRA'),(786,'משאבי שדה','MASH\'ABBE SADE'),(787,'משגב דב','MISGAV DOV'),(788,'משגב עם','MISGAV AM'),(789,'משהד','MESHHED'),(790,'משואה','MASSU\'A'),(791,'משואות יצחק','MASSUOT YIZHAQ'),(792,'משכיות','MASKIYYOT'),(793,'משמר איילון','MISHMAR AYYALON'),(794,'משמר דוד','MISHMAR DAWID'),(795,'משמר הירדן','MISHMAR HAYARDEN'),(796,'משמר הנגב','MISHMAR HANEGEV'),(797,'משמר העמק','MISHMAR HAEMEQ'),(798,'משמר השבעה','MISHMAR HASHIV\'A'),(799,'משמר השרון','MISHMAR HASHARON'),(800,'משמרות','MISHMAROT'),(801,'משמרת','MISHMERET'),(802,'משען','MASH\'EN'),(803,'מתן','MATTAN'),(804,'מתת','MATTAT'),(805,'מתתיהו','MATTITYAHU'),(806,'נאות גולן','NE\'OT GOLAN'),(807,'נאות הכיכר','NE\'OT HAKIKKAR'),(808,'נאות מרדכי','NE\'OT MORDEKHAY'),(809,'נאות סמדר','SHIZZAFON'),(810,'נאעורה','NA\'URA'),(811,'נבטים','NEVATIM'),(812,'נגבה','NEGBA'),(813,'נגוהות','NEGOHOT'),(814,'נהורה','NEHORA'),(815,'נהלל','NAHALAL'),(816,'נהריה','NAHARIYYA'),(817,'נוב','NOV'),(818,'נוגה','NOGAH'),(819,'נוה צוף','NEVE TSUF'),(820,'נווה','NAVE'),(821,'נווה אבות','NEWE AVOT'),(822,'נווה אור','NEWE UR'),(823,'נווה אטי\"ב','NEWE ATIV'),(824,'נווה אילן','NEWE ILAN'),(825,'נווה איתן','NEWE ETAN'),(826,'נווה דניאל','NEWE DANIYYEL'),(827,'נווה זוהר','NEWE ZOHAR'),(828,'נווה זיו','NEWE ZIV'),(829,'נווה חריף','NEWE HARIF'),(830,'נווה ים','NEWE YAM'),(831,'נווה ימין','NEWE YAMIN'),(832,'נווה ירק','NEWE YARAQ'),(833,'נווה מבטח','NEWE MIVTAH'),(834,'נווה מיכאל','NEWE MIKHA\'EL'),(835,'נווה שלום','NEWE SHALOM'),(836,'נועם','NO\'AM'),(837,'נוף איילון','NOF AYYALON'),(838,'נוף הגליל','NOF HAGALIL'),(839,'נופים','NOFIM'),(840,'נופית','NOFIT'),(841,'נופך','NOFEKH'),(842,'נוקדים','NOQEDIM'),(843,'נורדיה','NORDIYYA'),(844,'נורית','NURIT'),(845,'נחושה','NEHUSHA'),(846,'נחל עוז','NAHAL OZ'),(847,'נחלה','NAHALA'),(848,'נחליאל','NAHALI\'EL'),(849,'נחלים','NEHALIM'),(850,'נחם','NAHAM'),(851,'נחף','NAHEF'),(852,'נחשולים','NAHSHOLIM'),(853,'נחשון','NAHSHON'),(854,'נחשונים','NAHSHONIM'),(855,'נטועה','NETU\'A'),(856,'נטור','NATUR'),(857,'נטע','NETA'),(858,'נטעים','NETA\'IM'),(859,'נטף','NATAF'),(860,'ניין','NEIN'),(861,'ניל\"י','NILI'),(862,'ניצן','NIZZAN'),(863,'ניצן ב\'','NIZZAN B'),(864,'ניצנה','NIZZANA'),(865,'ניצני סיני','NIZZANE SINAY'),(866,'ניצני עוז','NIZZANE OZ'),(867,'ניצנים','NIZZANIM'),(868,'ניר אליהו','NIR ELIYYAHU'),(869,'ניר בנים','NIR BANIM'),(870,'ניר גלים','NIR GALLIM'),(871,'ניר דוד','NIR DAWID'),(872,'ניר ח\"ן','NIR HEN'),(873,'ניר יפה','NIR YAFE'),(874,'ניר יצחק','NIR YIZHAQ'),(875,'ניר ישראל','NIR YISRA\'EL'),(876,'ניר משה','NIR MOSHE'),(877,'ניר עוז','NIR OZ'),(878,'ניר עם','NIR AM'),(879,'ניר עציון','NIR EZYON'),(880,'ניר עקיבא','NIR AQIVA'),(881,'ניר צבי','NIR ZEVI'),(882,'נירים','NIRIM'),(883,'נירית','NIRIT'),(884,'נמרוד','NIMROD'),(885,'נס הרים','NES HARIM'),(886,'נס עמים','NES AMMIM'),(887,'נס ציונה','NES ZIYYONA'),(888,'נעורים','NE\'URIM'),(889,'נעלה','NA\'ALE'),(890,'נעמ\"ה','NAAMA'),(891,'נען','NA\'AN'),(892,'נערן','NA\'ARAN'),(893,'נצאצרה ','NASASRA'),(894,'נצר חזני','NEZER HAZZANI'),(895,'נצר סרני','NEZER SERENI'),(896,'נצרת','NAZARETH'),(897,'נשר','NESHER'),(898,'נתיב הגדוד','NETIV HAGEDUD'),(899,'נתיב הל\"ה','NETIV HALAMED-HE'),(900,'נתיב העשרה','NETIV HAASARA'),(901,'נתיב השיירה','NETIV HASHAYYARA'),(902,'נתיבות','NETIVOT'),(903,'נתניה','NETANYA'),(904,'סאג\'ור','SAJUR'),(905,'סאסא','SASA'),(906,'סביון','SAVYON'),(907,'סגולה','SEGULA'),(908,'סואעד','SAWA\'ID'),(909,'סואעד','SAWA\'ID'),(910,'סולם','SULAM'),(911,'סוסיה','SUSEYA'),(912,'סופה','SUFA'),(913,'סח\'נין','SAKHNIN'),(914,'סייד ','SAYYID'),(915,'סלמה','SALLAMA'),(916,'סלעית','SAL\'IT'),(917,'סמר','SAMAR'),(918,'סנסנה',''),(919,'סעד','SA\'AD'),(920,'סעוה','SA\'WA'),(921,'סער','SA\'AR'),(922,'ספיר','SAPPIR'),(923,'סתריה','SITRIYYA'),(924,'ע\'ג\'ר','GHAJAR'),(925,'עבדון','AVDON'),(926,'עברון','EVRON'),(927,'עגור','AGUR'),(928,'עדי','ADI'),(929,'עדנים','ADANIM'),(930,'עוזה','UZA'),(931,'עוזייר','UZEIR'),(932,'עולש','OLESH'),(933,'עומר','OMER'),(934,'עופר','OFER'),(935,'עופרה','OFRA'),(936,'עוצם','OZEM'),(937,'עוקבי','UQBI'),(938,'עזוז','EZUZ'),(939,'עזר','EZER'),(940,'עזריאל','AZRI\'EL'),(941,'עזריה','AZARYA'),(942,'עזריקם','AZRIQAM'),(943,'עטאוונה ','ATAWNE'),(944,'עטרת','ATERET'),(945,'עידן','IDDAN'),(946,'עיילבון','EILABUN'),(947,'עיינות','AYANOT'),(948,'עילוט','ILUT'),(949,'עין איילה','EN AYYALA'),(950,'עין אל-אסד','EIN AL-ASAD'),(951,'עין גב','EN GEV'),(952,'עין גדי','EN GEDI'),(953,'עין דור','EN DOR'),(954,'עין הבשור','EN HABESOR'),(955,'עין הוד','EN HOD'),(956,'עין החורש','EN HAHORESH'),(957,'עין המפרץ','EN HAMIFRAZ'),(958,'עין הנצי\"ב','EN HANAZIV'),(959,'עין העמק','EN HAEMEQ'),(960,'עין השופט','EN HASHOFET'),(961,'עין השלושה','EN HASHELOSHA'),(962,'עין ורד','EN WERED'),(963,'עין זיוון','EN ZIWAN'),(964,'עין חוד','EIN HOD'),(965,'עין חצבה','EN HAZEVA'),(966,'עין חרוד ','EN HAROD (IHUD)'),(967,'עין חרוד ','EN HAROD(ME\'UHAD)'),(968,'עין יהב','EN YAHAV'),(969,'עין יעקב','EN YA\'AQOV'),(970,'עין כרם','EN KAREM'),(971,'עין כרמל','EN KARMEL'),(972,'עין מאהל','EIN MAHEL'),(973,'עין נקובא','EIN NAQQUBA'),(974,'עין עירון','EN IRON'),(975,'עין צורים','EN ZURIM'),(976,'עין קנייא','EIN QINIYYE'),(977,'עין ראפה','EIN RAFA'),(978,'עין שמר','EN SHEMER'),(979,'עין שריד','EN SARID'),(980,'עין תמר','EN TAMAR'),(981,'עינת','ENAT'),(982,'עיר אובות','IR OVOT'),(983,'עכו','AKKO'),(984,'עלומים','ALUMIM'),(985,'עלי','ELI'),(986,'עלי זהב','ALE ZAHAV'),(987,'עלמה','ALMA'),(988,'עלמון','ALMON'),(989,'עמוקה','AMUQQA'),(990,'עמיחי','AMMIHAY'),(991,'עמינדב','AMMINADAV'),(992,'עמיעד','AMMI\'AD'),(993,'עמיעוז','AMMI\'OZ'),(994,'עמיקם','AMMIQAM'),(995,'עמיר','AMIR'),(996,'עמנואל','IMMANU\'EL'),(997,'עמקה','AMQA'),(998,'ענב','ENAV'),(999,'עספיא','ISIFYA'),(1000,'עפולה','AFULA'),(1001,'עץ אפרים','EZ EFRAYIM'),(1002,'עצמון שגב','ATSMON-SEGEV'),(1003,'עראבה','ARRABE'),(1004,'עראמשה','ARAMSHA'),(1005,'ערב אל נעים','ARRAB AL NAIM'),(1006,'ערד','ARAD'),(1007,'ערוגות','ARUGOT'),(1008,'ערערה','AR\'ARA'),(1009,'ערערה-בנגב','AR\'ARA-BANEGEV'),(1010,'עשרת','ASERET'),(1011,'עתלית','ATLIT'),(1012,'עתניאל','OTNI\'EL'),(1013,'פארן','PARAN'),(1014,'פדואל','PEDU\'EL'),(1015,'פדויים','PEDUYIM'),(1016,'פדיה','PEDAYA'),(1017,'פוריה ','PORIYYA'),(1018,'פוריה עילית','PORIYYA ILLIT'),(1019,'פוריידיס','FUREIDIS'),(1020,'פורת','PORAT'),(1021,'פטיש','PATTISH'),(1022,'פלך','PELEKH'),(1023,'פלמחים','PALMAHIM'),(1024,'פני חבר','PENE HEVER'),(1025,'פסגות','PESAGOT'),(1026,'פסוטה','FASSUTA'),(1027,'פעמי תש\"ז','PA\'AME TASHAZ'),(1028,'פצאל','PEZA\'EL'),(1029,'פקיעין','PEQI\'IN'),(1030,'פקיעין חדשה','PEQI\'IN HADASHA'),(1031,'פרדס חנה-כרכור','PARDES HANNA-KARKUR'),(1032,'פרדסיה','PARDESIYYA'),(1033,'פרוד','PAROD'),(1034,'פרזון','PERAZON'),(1035,'פרי גן','PERI GAN'),(1036,'פתח תקווה','PETAH TIQWA'),(1037,'פתחיה','PETAHYA'),(1038,'צאלים','ZE\'ELIM'),(1039,'צביה','ZVIYYA'),(1040,'צבעון','ZIV\'ON'),(1041,'צובה','ZOVA'),(1042,'צוחר','ZOHAR'),(1043,'צופיה','ZOFIYYA'),(1044,'צופים','ZUFIN'),(1045,'צופית','ZOFIT'),(1046,'צופר','ZOFAR'),(1047,'צוקי ים','SHOSHANNAT HAAMAQIM('),(1048,'צוקים','MAHANE BILDAD'),(1049,'צור הדסה','ZUR HADASSA'),(1050,'צור יצחק','ZUR YIZHAQ'),(1051,'צור משה','ZUR MOSHE'),(1052,'צור נתן','ZUR NATAN'),(1053,'צוריאל','ZURI\'EL'),(1054,'צורית','ZURIT'),(1055,'ציפורי','ZIPPORI'),(1056,'צלפון','ZELAFON'),(1057,'צנדלה','SANDALA'),(1058,'צפריה','ZAFRIYYA'),(1059,'צפרירים','ZAFRIRIM'),(1060,'צפת','ZEFAT'),(1061,'צרופה','ZERUFA'),(1062,'צרעה','ZOR\'A'),(1063,'קבועה ','QABBO\'A'),(1064,'קבוצת יבנה','QEVUZAT YAVNE'),(1065,'קדומים','QEDUMIM'),(1066,'קדימה-צורן','QADIMA-ZORAN'),(1067,'קדמה','QEDMA'),(1068,'קדמת צבי','QIDMAT ZEVI'),(1069,'קדר','QEDAR'),(1070,'קדרון','QIDRON'),(1071,'קדרים','QADDARIM'),(1072,'קודייראת א-צאנע','QUDEIRAT AS-SANI'),(1073,'קוואעין ','QAWA\'IN'),(1074,'קוממיות','QOMEMIYYUT'),(1075,'קורנית','QORANIT'),(1076,'קטורה','QETURA'),(1077,'קיסריה','QESARIYYA'),(1078,'קלחים','QELAHIM'),(1079,'קליה','QALYA'),(1080,'קלנסווה','QALANSAWE'),(1081,'קלע','QELA'),(1082,'קציר','QAZIR'),(1083,'קצר א-סר',''),(1084,'קצרין','QAZRIN'),(1085,'קרית אונו','QIRYAT ONO'),(1086,'קרית ארבע','QIRYAT ARBA'),(1087,'קרית אתא','QIRYAT ATTA'),(1088,'קרית ביאליק','QIRYAT BIALIK'),(1089,'קרית גת','QIRYAT GAT'),(1090,'קרית טבעון','QIRYAT TIV\'ON'),(1091,'קרית ים','QIRYAT YAM'),(1092,'קרית יערים','QIRYAT YE\'ARIM'),(1093,'קרית מוצקין','QIRYAT MOTZKIN'),(1094,'קרית מלאכי','QIRYAT MAL\'AKHI'),(1095,'קרית נטפים','QIRYAT NETAFIM'),(1096,'קרית ענבים','QIRYAT ANAVIM'),(1097,'קרית עקרון','QIRYAT EQRON'),(1098,'קרית שלמה','QIRYAT SHELOMO'),(1099,'קרית שמונה','QIRYAT SHEMONA'),(1100,'קרני שומרון','QARNE SHOMERON'),(1101,'קשת','QESHET'),(1102,'ראמה','RAME'),(1103,'ראס אל-עין','RAS AL-EIN'),(1104,'ראס עלי','RAS ALI'),(1105,'ראש העין','ROSH HAAYIN'),(1106,'ראש פינה','ROSH PINNA'),(1107,'ראש צורים','ROSH ZURIM'),(1108,'ראשון לציון','RISHON LEZIYYON'),(1109,'רבבה','REVAVA'),(1110,'רבדים','REVADIM'),(1111,'רביבים','REVIVIM'),(1112,'רביד','RAVID'),(1113,'רגבה','REGBA'),(1114,'רגבים','REGAVIM'),(1115,'רהט','RAHAT'),(1116,'רווחה','REWAHA'),(1117,'רוויה','REWAYA'),(1118,'רוח מדבר','RUAH MIDBAR'),(1119,'רוחמה','RUHAMA'),(1120,'רומאנה','RUMMANE'),(1121,'רומת הייב','RUMAT HEIB'),(1122,'רועי','RO\'I'),(1123,'רותם','ROTEM'),(1124,'רחוב','REHOV'),(1125,'רחובות','REHOVOT'),(1126,'רחלים','REHELIM'),(1127,'ריחאניה','REIHANIYYE'),(1128,'ריחן','REHAN'),(1129,'ריינה','REINE'),(1130,'רימונים','RIMMONIM'),(1131,'רינתיה','RINNATYA'),(1132,'רכסים','REKHASIM'),(1133,'רם-און','RAM-ON'),(1134,'רמות','RAMOT'),(1135,'רמות השבים','RAMOT HASHAVIM'),(1136,'רמות מאיר','RAMOT ME\'IR'),(1137,'רמות מנשה','RAMOT MENASHE'),(1138,'רמות נפתלי','RAMOT NAFTALI'),(1139,'רמלה','RAMLA'),(1140,'רמת גן','RAMAT GAN'),(1141,'רמת דוד','RAMAT DAWID'),(1142,'רמת הכובש','RAMAT HAKOVESH'),(1143,'רמת השופט','RAMAT HASHOFET'),(1144,'רמת השרון','RAMAT HASHARON'),(1145,'רמת יוחנן','RAMAT YOHANAN'),(1146,'רמת ישי','RAMAT YISHAY'),(1147,'רמת מגשימים','RAMAT MAGSHIMIM'),(1148,'רמת צבי','RAMAT ZEVI'),(1149,'רמת רזיאל','RAMAT RAZI\'EL'),(1150,'רמת רחל','RAMAT RAHEL'),(1151,'רנן','RANNEN'),(1152,'רעים','RE\'IM'),(1153,'רעננה','RA\'ANANA'),(1154,'רקפת','RAQEFET'),(1155,'רשפון','RISHPON'),(1156,'רשפים','RESHAFIM'),(1157,'רתמים','RETAMIM'),(1158,'שאר ישוב','SHE\'AR YASHUV'),(1159,'שבי דרום','SHAVE DAROM'),(1160,'שבי ציון','SHAVE ZIYYON'),(1161,'שבי שומרון','SHAVE SHOMERON'),(1162,'שבלי - אום אל-גנם','SHIBLI'),(1163,'שגב-שלום','SEGEV-SHALOM'),(1164,'שדה אילן','SEDE ILAN'),(1165,'שדה אליהו','SEDE ELIYYAHU'),(1166,'שדה אליעזר','SEDE ELI\'EZER'),(1167,'שדה בוקר','SEDE BOQER'),(1168,'שדה דוד','SEDE DAWID'),(1169,'שדה ורבורג','SEDE WARBURG'),(1170,'שדה יואב','SEDE YO\'AV'),(1171,'שדה יעקב','SEDE YA\'AQOV'),(1172,'שדה יצחק','SEDE YIZHAQ'),(1173,'שדה משה','SEDE MOSHE'),(1174,'שדה נחום','SEDE NAHUM'),(1175,'שדה נחמיה','SEDE NEHEMYA'),(1176,'שדה ניצן','SEDE NIZZAN'),(1177,'שדה עוזיהו','SEDE UZZIYYAHU'),(1178,'שדה צבי','SEDE ZEVI'),(1179,'שדות ים','SEDOT YAM'),(1180,'שדות מיכה','SEDOT MIKHA'),(1181,'שדי אברהם','SEDE AVRAHAM'),(1182,'שדי חמד','SEDE HEMED'),(1183,'שדי תרומות','SEDE TERUMOT'),(1184,'שדמה','SHEDEMA'),(1185,'שדמות דבורה','SHADMOT DEVORA'),(1186,'שדמות מחולה','SHADMOT MEHOLA'),(1187,'שדרות','SEDEROT'),(1188,'שואבה','SHO\'EVA'),(1189,'שובה','SHUVA'),(1190,'שובל','SHOVAL'),(1191,'שוהם','SHOHAM'),(1192,'שומרה','SHOMERA'),(1193,'שומריה','SHOMERIYYA'),(1194,'שוקדה','SHOQEDA'),(1195,'שורש','SHORESH'),(1196,'שורשים','SHORASHIM'),(1197,'שושנת העמקים','SHOSHANNAT HAAMAQIM'),(1198,'שזור','SHEZOR'),(1199,'שחר','SHAHAR'),(1200,'שחרות','SHAHARUT'),(1201,'שיבולים','SHIBBOLIM'),(1202,'שיטים','NAHAL SHITTIM'),(1203,'שייח\' דנון','SHEIKH DANNUN'),(1204,'שילה','SHILO'),(1205,'שילת','SHILAT'),(1206,'שכניה','SHEKHANYA'),(1207,'שלווה','SHALWA'),(1208,'שלווה במדבר','SHALVA BAMIDBAR'),(1209,'שלוחות','SHELUHOT'),(1210,'שלומי','SHELOMI'),(1211,'שלומית','SHLOMIT'),(1212,'שמיר','SHAMIR'),(1213,'שמעה','SHIM\'A'),(1214,'שמרת','SHAMERAT'),(1215,'שמשית','SHIMSHIT'),(1216,'שני','SHANI'),(1217,'שניר','SENIR'),(1218,'שעב','SHA\'AB'),(1219,'שעורים','SE\'ORIM'),(1220,'שעל','SHA\'AL'),(1221,'שעלבים','SHA\'ALVIM'),(1222,'שער אפרים','SHA\'AR EFRAYIM'),(1223,'שער הגולן','SHA\'AR HAGOLAN'),(1224,'שער העמקים','SHA\'AR HAAMAQIM'),(1225,'שער מנשה','SHA\'AR MENASHE'),(1226,'שערי תקווה','SHA\'ARE TIQWA'),(1227,'שפיים','SHEFAYIM'),(1228,'שפיר','SHAFIR'),(1229,'שפר','SHEFER'),(1230,'שפרעם','SHEFAR\'AM'),(1231,'שקד','SHAQED'),(1232,'שקף','SHEQEF'),(1233,'שרונה','SHARONA'),(1234,'שריגים','SRIGIM'),(1235,'שריד','SARID'),(1236,'שרשרת','SHARSHERET'),(1237,'שתולה','SHETULA'),(1238,'שתולים','SHETULIM'),(1239,'תאשור','TE\'ASHUR'),(1240,'תדהר','TIDHAR'),(1241,'תובל','TUVAL'),(1242,'תומר','TOMER'),(1243,'תושיה','TUSHIYYA'),(1244,'תימורים','TIMMORIM'),(1245,'תירוש','TIROSH'),(1246,'תל אביב - יפו','TEL AVIV - YAFO'),(1247,'תל יוסף','TEL YOSEF'),(1248,'תל יצחק','TEL YIZHAQ'),(1249,'תל מונד','TEL MOND'),(1250,'תל עדשים','TEL ADASHIM'),(1251,'תל קציר','TEL QAZIR'),(1252,'תל שבע','TEL SHEVA'),(1253,'תל תאומים','TEL TE\'OMIM'),(1254,'תלם','TELEM'),(1255,'תלמי אליהו','TALME ELIYYAHU'),(1256,'תלמי אלעזר','TALME EL\'AZAR'),(1257,'תלמי ביל\"ו','TALME BILU'),(1258,'תלמי יוסף','TALME YOSEF'),(1259,'תלמי יחיאל','TALME YEHI\'EL'),(1260,'תלמי יפה','TALME YAFE'),(1261,'תלמים','TELAMIM'),(1262,'תמרת','TIMRAT'),(1263,'תנובות','TENUVOT'),(1264,'תעוז','TA\'OZ'),(1265,'תפרח','TIFRAH'),(1266,'תקומה','TEQUMA'),(1267,'תקוע','TEQOA'),(1268,'תראבין א-צאנע ','TARABIN AS-SANI'),(1269,'תרום','TARUM'),(1270,'תל אביב','TEL AVIV'),(1271,'יפו','YAFO');
/*!40000 ALTER TABLE `city` ENABLE KEYS */;
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

--
-- Table structure for table `isolated`
--

DROP TABLE IF EXISTS `isolated`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `isolated` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userIsolatedId` int(11) unsigned NOT NULL,
  `public_phone` tinyint(1) unsigned DEFAULT '0',
  `public_meeting` tinyint(1) unsigned DEFAULT '0',
  `meeting_time` datetime DEFAULT NULL,
  `blowerMeetingId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
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
  `recordId` int(11) unsigned DEFAULT NULL,
  `principalType` enum('$OWNER','ROLE','USER') DEFAULT NULL,
  `principalId` varchar(100) DEFAULT NULL,
  `permission` enum('ALLOW','DENY') DEFAULT 'DENY',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8;
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
  `userBlowerId` int(11) unsigned NOT NULL,
  `confirm` tinyint(1) unsigned DEFAULT '0',
  `can_blow_x_times` int(11) unsigned NOT NULL,
  `volunteering_start_time` datetime NOT NULL,
  `volunteering_end_time` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
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
  `cityId` varchar(50) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `street` varchar(50) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `comments` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `start_time` datetime NOT NULL,
  `blowerId` int(11) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shofar_blower_pub`
--

LOCK TABLES `shofar_blower_pub` WRITE;
/*!40000 ALTER TABLE `shofar_blower_pub` DISABLE KEYS */;
/*!40000 ALTER TABLE `shofar_blower_pub` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-07-14 15:33:45
