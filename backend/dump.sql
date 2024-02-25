-- MariaDB dump 10.19  Distrib 10.4.28-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: comp390
-- ------------------------------------------------------
-- Server version	10.4.28-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `friend_requests`
--

DROP TABLE IF EXISTS `friend_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `friend_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `status` enum('pending','accepted','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `sender_id` (`sender_id`),
  KEY `receiver_id` (`receiver_id`),
  CONSTRAINT `friend_requests_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`),
  CONSTRAINT `friend_requests_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `friend_requests`
--

LOCK TABLES `friend_requests` WRITE;
/*!40000 ALTER TABLE `friend_requests` DISABLE KEYS */;
INSERT INTO `friend_requests` VALUES (5,6,10,'rejected','2023-11-22 19:24:38'),(31,13,8,'pending','2024-01-24 14:15:06'),(32,13,11,'pending','2024-01-24 14:15:23'),(36,10,14,'pending','2024-02-11 00:58:02'),(37,10,6,'pending','2024-02-19 16:34:25'),(39,10,9,'pending','2024-02-19 16:38:11'),(41,7,6,'pending','2024-02-19 16:40:43');
/*!40000 ALTER TABLE `friend_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `friendships`
--

DROP TABLE IF EXISTS `friendships`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `friendships` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user1_id` int(11) NOT NULL,
  `user2_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user1_id` (`user1_id`),
  KEY `user2_id` (`user2_id`),
  CONSTRAINT `friendships_ibfk_1` FOREIGN KEY (`user1_id`) REFERENCES `users` (`id`),
  CONSTRAINT `friendships_ibfk_2` FOREIGN KEY (`user2_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `friendships`
--

LOCK TABLES `friendships` WRITE;
/*!40000 ALTER TABLE `friendships` DISABLE KEYS */;
INSERT INTO `friendships` VALUES (4,10,12,'2023-11-27 18:51:30'),(8,7,10,'2024-02-19 16:38:26'),(9,8,10,'2024-02-19 17:24:52'),(10,7,8,'2024-02-20 18:59:54'),(11,10,15,'2024-02-24 16:53:31'),(12,7,15,'2024-02-24 18:20:22');
/*!40000 ALTER TABLE `friendships` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `game_reviews`
--

DROP TABLE IF EXISTS `game_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `game_reviews` (
  `review_id` int(11) NOT NULL AUTO_INCREMENT,
  `game_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `review_text` text DEFAULT NULL,
  `star_rating` int(11) DEFAULT NULL CHECK (`star_rating` >= 1 and `star_rating` <= 5),
  `review_date` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`review_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `game_reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `game_reviews`
--

LOCK TABLES `game_reviews` WRITE;
/*!40000 ALTER TABLE `game_reviews` DISABLE KEYS */;
INSERT INTO `game_reviews` VALUES (1,962495,10,'Amazing!',5,'2024-02-24 23:52:19'),(2,962495,7,'Its alright',3,'2024-02-24 23:58:59');
/*!40000 ALTER TABLE `game_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `messages` (
  `message_id` int(11) NOT NULL AUTO_INCREMENT,
  `sender_id` int(11) DEFAULT NULL,
  `receiver_id` int(11) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`message_id`),
  KEY `sender_id` (`sender_id`),
  KEY `receiver_id` (`receiver_id`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`),
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (2,8,10,'hi','2024-02-20 21:52:46'),(3,8,10,'hi','2024-02-20 22:01:40'),(4,8,10,'Helloadhlsiahdla','2024-02-20 22:01:45'),(5,8,7,'Hello','2024-02-20 22:02:34'),(6,10,8,'Hey, how are you?','2024-02-20 22:31:43'),(7,8,10,'heihi','2024-02-20 22:48:07'),(8,10,7,'Hello','2024-02-24 16:44:57'),(9,10,8,'Hey','2024-02-24 16:45:04'),(13,10,15,'You smell funny','2024-02-24 16:53:40'),(15,7,15,'hey bby','2024-02-24 18:20:39');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_favorites`
--

DROP TABLE IF EXISTS `user_favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_favorites` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `game_id` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`,`game_id`),
  CONSTRAINT `user_favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_favorites`
--

LOCK TABLES `user_favorites` WRITE;
/*!40000 ALTER TABLE `user_favorites` DISABLE KEYS */;
INSERT INTO `user_favorites` VALUES (25,8,'29239'),(27,8,'3144'),(22,8,'324997'),(11,10,'1391'),(15,10,'23943'),(12,10,'244716'),(31,10,'28153'),(32,10,'3144'),(2,10,'324997'),(13,10,'53445'),(29,10,'662316'),(1,10,'772603'),(21,10,'795632'),(20,10,'846303'),(18,10,'850705'),(17,10,'962011'),(14,10,'962495'),(30,10,'976564'),(37,15,'16779'),(35,15,'241044'),(39,15,'24937'),(33,15,'27024'),(34,15,'27036'),(36,15,'36'),(38,15,'4471');
/*!40000 ALTER TABLE `user_favorites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_game_preferences`
--

DROP TABLE IF EXISTS `user_game_preferences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_game_preferences` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `game_id` int(11) NOT NULL,
  `preference` varchar(10) DEFAULT NULL CHECK (`preference` in ('like','dislike')),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`,`game_id`),
  CONSTRAINT `user_game_preferences_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=274 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_game_preferences`
--

LOCK TABLES `user_game_preferences` WRITE;
/*!40000 ALTER TABLE `user_game_preferences` DISABLE KEYS */;
INSERT INTO `user_game_preferences` VALUES (1,10,58812,'dislike'),(2,10,11859,'like'),(3,10,766,'dislike'),(4,10,362,'like'),(5,10,19103,'dislike'),(6,10,9767,'dislike'),(14,10,10142,'dislike'),(15,13,4427,'like'),(16,13,11859,'like'),(17,13,3144,'like'),(18,13,19301,'like'),(19,13,10035,'like'),(20,13,4332,'like'),(21,13,32,'like'),(22,13,3636,'dislike'),(23,13,4459,'dislike'),(24,13,108,'dislike'),(25,13,1447,'dislike'),(26,13,766,'dislike'),(27,13,422,'dislike'),(28,13,12020,'like'),(29,13,3604,'like'),(36,13,5583,'like'),(37,13,29028,'like'),(38,7,10243,'like'),(39,7,23027,'like'),(40,7,4200,'like'),(41,7,17540,'dislike'),(42,7,416,'like'),(43,7,19487,'dislike'),(44,7,3543,'dislike'),(45,7,257201,'dislike'),(46,7,19710,'like'),(47,7,3287,'like'),(48,7,3790,'dislike'),(49,7,13537,'dislike'),(52,7,3747,'dislike'),(53,7,39,'like'),(54,7,654,'like'),(55,7,3328,'like'),(56,7,5286,'like'),(57,7,3272,'like'),(60,7,4459,'like'),(61,7,430,'dislike'),(62,7,864,'like'),(63,7,4166,'like'),(64,8,4332,'like'),(65,8,3272,'like'),(66,8,3604,'dislike'),(67,8,9882,'dislike'),(68,8,1447,'dislike'),(69,8,422,'like'),(70,8,3439,'dislike'),(71,8,4514,'like'),(73,8,19487,'like'),(74,8,5563,'dislike'),(75,8,802,'like'),(76,8,12536,'dislike'),(77,8,50738,'like'),(78,8,11936,'dislike'),(79,8,4286,'like'),(80,8,16944,'like'),(81,8,1030,'like'),(82,8,766,'like'),(84,8,3612,'like'),(86,8,11859,'like'),(87,9,10533,'like'),(88,9,5583,'like'),(89,9,13537,'dislike'),(90,9,4514,'dislike'),(91,9,4062,'like'),(92,9,3612,'dislike'),(93,9,362,'dislike'),(94,9,11935,'dislike'),(95,9,18080,'like'),(96,9,3439,'dislike'),(97,9,17540,'dislike'),(98,9,3498,'like'),(99,9,10754,'like'),(100,9,4161,'dislike'),(101,9,802,'like'),(102,9,3603,'like'),(106,9,4386,'like'),(107,9,11936,'dislike'),(108,9,1447,'like'),(110,9,29177,'dislike'),(111,9,4286,'like'),(112,9,10142,'dislike'),(113,9,4427,'dislike'),(116,10,13668,'dislike'),(117,10,3017,'like'),(118,10,17822,'like'),(119,10,39,'dislike'),(120,10,29177,'like'),(121,10,3939,'dislike'),(122,10,58175,'like'),(123,10,13537,'like'),(124,10,19710,'dislike'),(125,10,3328,'like'),(126,10,10035,'like'),(127,10,3790,'like'),(130,10,3498,'like'),(131,8,3328,'like'),(132,8,3603,'dislike'),(133,8,4459,'like'),(134,8,4248,'dislike'),(138,8,11935,'like'),(139,8,12020,'like'),(140,8,3747,'like'),(141,8,4062,'like'),(142,8,864,'dislike'),(145,8,257201,'dislike'),(147,8,290856,'like'),(148,8,4252,'like'),(149,8,32,'like'),(150,8,11934,'like'),(164,10,4427,'like'),(165,10,28,'like'),(170,10,1447,'like'),(171,10,32,'like'),(172,10,4200,'like'),(173,10,12020,'like'),(174,10,17540,'dislike'),(175,10,3612,'dislike'),(176,10,11935,'dislike'),(177,10,3070,'like'),(178,10,5286,'like'),(184,10,4514,'like'),(185,15,4427,'dislike'),(186,15,4062,'dislike'),(187,15,802,'dislike'),(188,15,10243,'dislike'),(189,15,17540,'like'),(190,15,3328,'dislike'),(191,15,4459,'like'),(192,15,362,'dislike'),(193,15,4248,'dislike'),(194,15,10533,'dislike'),(195,15,29177,'like'),(196,15,3498,'like'),(197,15,19103,'like'),(198,15,2551,'dislike'),(199,15,5563,'dislike'),(203,15,4806,'dislike'),(204,15,3192,'dislike'),(205,15,50738,'dislike'),(206,15,11934,'dislike'),(207,15,1447,'dislike'),(208,15,41494,'dislike'),(209,15,11973,'dislike'),(210,15,13668,'dislike'),(211,15,3543,'dislike'),(212,15,290856,'dislike'),(213,15,422,'dislike'),(216,15,416,'like'),(217,15,278,'dislike'),(218,15,3790,'dislike'),(219,15,13535,'dislike'),(220,15,654,'like'),(221,15,430,'like'),(222,15,2462,'dislike'),(223,15,3939,'dislike'),(224,15,3696,'dislike'),(225,15,11859,'dislike'),(226,15,3287,'dislike'),(228,15,4828,'dislike'),(230,15,11936,'dislike'),(232,15,9882,'dislike'),(233,15,13536,'dislike'),(234,15,4200,'dislike'),(235,15,10754,'dislike'),(236,15,39,'dislike'),(239,15,11935,'dislike'),(241,8,29239,'like'),(242,8,3144,'like'),(243,8,324997,'like'),(244,10,1391,'like'),(245,10,23943,'like'),(246,10,244716,'like'),(247,10,324997,'like'),(248,10,53445,'like'),(249,10,772603,'like'),(250,10,795632,'like'),(251,10,846303,'like'),(252,10,850705,'like'),(253,10,962011,'like'),(254,10,962495,'like'),(256,10,662316,'like'),(257,10,976564,'like'),(259,10,28153,'like'),(262,10,3144,'like'),(263,7,58812,'like'),(264,7,19103,'dislike'),(265,7,3498,'like'),(266,7,4161,'like'),(267,15,27024,'like'),(268,15,27036,'like'),(269,15,241044,'like'),(270,15,36,'like'),(271,15,16779,'like'),(272,15,4471,'like'),(273,15,24937,'like');
/*!40000 ALTER TABLE `user_game_preferences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `hashed_password` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (6,'hash','$2b$10$6BR1Mc17dYbb1gM4kQmz6Oe/bk1OJYsvQBlIgIcXtd0WLHF/F80/i'),(7,'hash2','$2b$10$onPOgMRZEeEIa1G4ePmgeeU91GcxyazQ2stl.8Bsg0lmRuoyxIWiq'),(8,'hash3','$2b$10$NItuHeoWOQVp7RxnhHCxNO1k9AB/Ik1.NXT1x8dgORK43YCtgqKXK'),(9,'hash4','$2b$10$yu7N7TJfPL5a5ZO1tc/GFuHV23OZeyjZldWM0sqLPD/n6FQ063Q1e'),(10,'hamza','$2b$10$rT5Qa6F0sJeRoYYix/LP9eF581Tn3UHl9zIag3a6PgzQ.wVvMEwSO'),(11,'dolphin007','$2b$10$9g5F/ftXd8HdupzP.33PDORE3g4p8JOH8XeiB/NC11eWutN6ekaqG'),(12,'gorogorologococomoco123cocomoco','$2b$10$jMiPXs2ul18yXsAYsMK/j.N.H2qvZ8RRgHFrxQpjcAZUO02r/Pjzq'),(13,'user2','$2b$10$PfYcUCuKMpqUfutHX6HWyeGF7yebsmYG/07uq/378bn.UNS/L32xK'),(14,'h','$2b$10$rdWu8LFAV6iehwEGLsxVtOLuDxWfoWn/8hOk2KTD8tCo/pz2Crbrq'),(15,'sani','$2b$10$OH3t4aVtHBEZy5xDzY0sMuT1HLHodQSBxjUeiQW6C8hauZP/WM6LW');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-02-25  0:16:25
