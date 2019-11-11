CREATE TABLE `models_something` (/*this should be lower case with underscore*/
  
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(200) DEFAULT NULL,
  `description` text default null,
  
  `image_format` enum('png','jpg','jpeg','gif') CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT 'png',
  
  `category` varchar(255) DEFAULT NULL, 
  
  `created` datetime DEFAULT NULL,
  `updated` datetime DEFAULT NULL,
  `userId` int(11) default null, /*Every relation should consist of two names: */
  `owner` int(11) DEFAULT NULL, /*userId*/
  
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8
