-- phpMyAdmin SQL Dump
-- version 4.8.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 05, 2019 at 02:00 PM
-- Server version: 10.4.8-MariaDB
-- PHP Version: 7.2.9

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `mgmt`
--

-- --------------------------------------------------------

--
-- Table structure for table `accesstoken`
--

CREATE TABLE `accesstoken` (
  `id` varchar(255) NOT NULL,
  `ttl` int(11) DEFAULT NULL,
  `scopes` text DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `userId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `acl`
--

CREATE TABLE `acl` (
  `id` int(11) NOT NULL,
  `model` varchar(512) DEFAULT NULL,
  `property` varchar(512) DEFAULT NULL,
  `accessType` varchar(512) DEFAULT NULL,
  `permission` varchar(512) DEFAULT NULL,
  `principalType` varchar(512) DEFAULT NULL,
  `principalId` varchar(512) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `id` int(11) NOT NULL,
  `realm` varchar(512) DEFAULT NULL,
  `username` varchar(512) DEFAULT NULL,
  `password` varchar(512) NOT NULL,
  `email` varchar(512) NOT NULL,
  `emailVerified` tinyint(1) DEFAULT NULL,
  `verificationToken` varchar(512) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`id`, `realm`, `username`, `password`, `email`, `emailVerified`, `verificationToken`) VALUES
(1, NULL, 'admin', '$2a$10$zG9VRxeeV6xXWIB3TMI3p.hwK.B8cK.pLMXH.8yb/TLXBEPg5tCK6', 'admin@mgmt.com', 1, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `branch`
--

CREATE TABLE `branch` (
  `id` int(11) NOT NULL,
  `nameEn` varchar(512) NOT NULL,
  `nameAr` varchar(512) NOT NULL,
  `addressEn` varchar(512) NOT NULL,
  `addressAr` varchar(512) NOT NULL,
  `instituteId` int(11) NOT NULL,
  `isMain` tinyint(1) NOT NULL,
  `phonenumber` varchar(512) DEFAULT NULL,
  `telnumber` varchar(512) DEFAULT NULL,
  `lat` int(11) NOT NULL,
  `lang` int(11) NOT NULL,
  `status` varchar(512) NOT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `branch`
--

INSERT INTO `branch` (`id`, `nameEn`, `nameAr`, `addressEn`, `addressAr`, `instituteId`, `isMain`, `phonenumber`, `telnumber`, `lat`, `lang`, `status`, `createdAt`) VALUES
(1, 'new horizen branch1', 'نيو هورايزين الفرع الاول', 'damas', 'دمشق', 1, 1, '+963932237947', '0114433252', 0, 0, 'active', '2019-09-30 12:23:04'),
(2, 'new horizen branch2', 'نيو هورايزين الفرع الثاني', 'damas', 'دمشق', 1, 0, '+963957465877', '0114433253', 0, 0, 'active', '2019-09-30 12:24:00');

-- --------------------------------------------------------

--
-- Table structure for table `branchadmin`
--

CREATE TABLE `branchadmin` (
  `id` int(11) NOT NULL,
  `userInstituteId` int(11) NOT NULL,
  `branchId` int(11) NOT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `branchadmin`
--

INSERT INTO `branchadmin` (`id`, `userInstituteId`, `branchId`, `createdAt`) VALUES
(1, 4, 1, '2019-09-30 12:32:37');

-- --------------------------------------------------------

--
-- Table structure for table `branchimages`
--

CREATE TABLE `branchimages` (
  `id` int(11) NOT NULL,
  `imageId` int(11) NOT NULL,
  `branchId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `branchimages`
--

INSERT INTO `branchimages` (`id`, `imageId`, `branchId`) VALUES
(3, 2, 2),
(4, 3, 2),
(5, 2, 1),
(6, 3, 1);

-- --------------------------------------------------------

--
-- Table structure for table `category`
--

CREATE TABLE `category` (
  `id` int(11) NOT NULL,
  `nameEn` varchar(512) NOT NULL,
  `nameAr` varchar(512) NOT NULL,
  `status` varchar(512) NOT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `category`
--

INSERT INTO `category` (`id`, `nameEn`, `nameAr`, `status`, `createdAt`) VALUES
(1, 'scientific', 'علمي', 'active', '2019-09-30 11:36:00'),
(2, 'literary', 'أدبي', 'active', '2019-09-30 11:36:00'),
(3, 'language', 'لغات', 'active', '2019-09-30 11:36:00');

-- --------------------------------------------------------

--
-- Table structure for table `course`
--

CREATE TABLE `course` (
  `id` int(11) NOT NULL,
  `instituteId` int(11) NOT NULL,
  `branchId` int(11) NOT NULL,
  `subcategoryId` int(11) NOT NULL,
  `cost` int(11) NOT NULL,
  `sessionsNumber` int(11) NOT NULL,
  `nameEn` varchar(512) NOT NULL,
  `nameAr` varchar(512) NOT NULL,
  `descriptionEn` varchar(512) NOT NULL,
  `descriptionAr` varchar(512) NOT NULL,
  `startAt` datetime NOT NULL,
  `maxCountStudent` int(11) NOT NULL,
  `countStudent` int(11) NOT NULL,
  `sessionAvgDuration` int(11) NOT NULL,
  `waitingListId` int(11) DEFAULT NULL,
  `status` varchar(512) NOT NULL,
  `createdAt` datetime NOT NULL,
  `countStudentInQueue` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `course`
--

INSERT INTO `course` (`id`, `instituteId`, `branchId`, `subcategoryId`, `cost`, `sessionsNumber`, `nameEn`, `nameAr`, `descriptionEn`, `descriptionAr`, `startAt`, `maxCountStudent`, `countStudent`, `sessionAvgDuration`, `waitingListId`, `status`, `createdAt`, `countStudentInQueue`) VALUES
(2, 1, 1, 5, 10000, 8, 'course english', 'كورس انكليزي', 'course english level b', 'كورس انكليزي مستوى B', '2019-10-31 22:00:00', 15, 3, 2, NULL, 'active', '2019-10-01 13:43:31', -2),
(10, 1, 1, 5, 8000, 8, 'course english', 'كورس انكليزي', 'course english level b', 'كورس انكليزي مستوى B', '2019-10-31 22:00:00', 15, 1, 2, NULL, 'active', '2019-10-01 13:51:28', 0);

-- --------------------------------------------------------

--
-- Table structure for table `courseimages`
--

CREATE TABLE `courseimages` (
  `id` int(11) NOT NULL,
  `courseId` int(11) NOT NULL,
  `imageId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `courseimages`
--

INSERT INTO `courseimages` (`id`, `courseId`, `imageId`) VALUES
(17, 10, 2),
(18, 10, 3),
(21, 2, 2);

-- --------------------------------------------------------

--
-- Table structure for table `institute`
--

CREATE TABLE `institute` (
  `id` int(11) NOT NULL,
  `nameEn` varchar(512) NOT NULL,
  `nameAr` varchar(512) NOT NULL,
  `descriptionEn` varchar(512) NOT NULL,
  `descriptionAr` varchar(512) NOT NULL,
  `logoId` int(11) NOT NULL,
  `dateOfIncorporation` datetime NOT NULL,
  `status` varchar(512) NOT NULL,
  `statusAPI` varchar(512) NOT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `institute`
--

INSERT INTO `institute` (`id`, `nameEn`, `nameAr`, `descriptionEn`, `descriptionAr`, `logoId`, `dateOfIncorporation`, `status`, `statusAPI`, `createdAt`) VALUES
(1, 'new-horizon', 'نيو هورايزين', 'english languages', 'لغة انكليزي', 1, '2019-09-24 09:53:21', 'active', 'active', '2019-09-30 12:04:47'),
(2, 'alrayan', 'الريان', 'english languages', 'لغة انكليزي', 4, '2019-09-24 09:53:21', 'active', 'active', '2019-09-30 12:07:55');

-- --------------------------------------------------------

--
-- Table structure for table `instituteadmin`
--

CREATE TABLE `instituteadmin` (
  `id` int(11) NOT NULL,
  `userInstituteId` int(11) NOT NULL,
  `instituteId` int(11) NOT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `instituteadmin`
--

INSERT INTO `instituteadmin` (`id`, `userInstituteId`, `instituteId`, `createdAt`) VALUES
(1, 1, 1, '2019-09-30 12:04:47'),
(2, 2, 2, '2019-09-30 12:07:55'),
(3, 3, 1, '2019-09-30 12:20:52');

-- --------------------------------------------------------

--
-- Table structure for table `institutesimages`
--

CREATE TABLE `institutesimages` (
  `id` int(11) NOT NULL,
  `imageId` int(11) NOT NULL,
  `instituteId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `institutesimages`
--

INSERT INTO `institutesimages` (`id`, `imageId`, `instituteId`) VALUES
(1, 2, 1),
(2, 3, 1);

-- --------------------------------------------------------

--
-- Table structure for table `media`
--

CREATE TABLE `media` (
  `id` int(11) NOT NULL,
  `url` varchar(512) NOT NULL,
  `thumbUrl` varchar(512) DEFAULT NULL,
  `webThumbUrl` varchar(512) DEFAULT NULL,
  `type` varchar(512) NOT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `media`
--

INSERT INTO `media` (`id`, `url`, `thumbUrl`, `webThumbUrl`, `type`, `createdAt`) VALUES
(1, 'http://localhost:3000/api/uploadFiles/image/download/0e05fee0-e37a-11e9-8f03-2ff62213890b11569844897230.png', NULL, '', 'image', '2019-09-30 12:01:37'),
(2, 'http://localhost:3000/api/uploadFiles/image/download/21372c50-e37a-11e9-8f03-2ff62213890b11569844929429.jpg', NULL, '', 'image', '2019-09-30 12:02:09'),
(3, 'http://localhost:3000/api/uploadFiles/image/download/26320b80-e37a-11e9-8f03-2ff62213890b11569844937784.jpg', NULL, '', 'image', '2019-09-30 12:02:17'),
(4, 'http://localhost:3000/api/uploadFiles/image/download/2b987dc0-e37a-11e9-8f03-2ff62213890b11569844946844.jpg', NULL, '', 'image', '2019-09-30 12:02:26');

-- --------------------------------------------------------

--
-- Table structure for table `multiaccesstoken`
--

CREATE TABLE `multiaccesstoken` (
  `id` varchar(255) NOT NULL,
  `ttl` int(11) DEFAULT NULL,
  `scopes` text DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `userId` varchar(255) DEFAULT NULL,
  `principalType` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `multiaccesstoken`
--

INSERT INTO `multiaccesstoken` (`id`, `ttl`, `scopes`, `created`, `userId`, `principalType`) VALUES
('AFZI8TsD5bruYwuBwkBb1HELnNu6Gd2A4LAVqVFQBXVa202m6CyYZmdMr69TCank', 31556926, NULL, '2019-10-01 11:53:17', '2', 'userInstitute'),
('b45yBdjkzzwnuQ86mDeu5XTJurEDir0kReCPlfQPvL5fTj1LKEnJSqhr97xzg6Fl', 31556926, NULL, '2019-09-30 11:39:10', '1', 'admin'),
('I305GwuYjJv2BuwriOizlxJ1AGpj3qRRSp3Aoji74mpaOkPc5SP6ZxJQIJqdO8e9', 31556926, NULL, '2019-09-30 12:09:51', '2', 'userInstitute'),
('ULFZNkRAu4jAyH720kjzIGnBXH7FBEYeVv1CyJX2Ji28PEtUUAGWuFK6Dyto97ac', 31556926, NULL, '2019-10-16 08:17:59', '1', 'admin'),
('Yh3x0IQXgb92x3Jicvo852DwTvKCvnmYqKSpjo2jIeUCQfSvHVpFpoPdlJ7b5GKj', 31556926, NULL, '2019-09-30 11:40:49', '1', 'admin'),
('ZV1f0VL5oKxkR0PIy2SUTQAMsclWTtw1xIgow5Z5yAEWjvsGJG2TnI0XgUV6fpj6', 31556926, NULL, '2019-10-07 11:50:38', '1', 'userInstitute');

-- --------------------------------------------------------

--
-- Table structure for table `notification`
--

CREATE TABLE `notification` (
  `id` int(11) NOT NULL,
  `studentId` int(11) DEFAULT NULL,
  `teacherId` int(11) DEFAULT NULL,
  `isSeen` tinyint(1) NOT NULL,
  `idRead` tinyint(1) NOT NULL,
  `createdAt` datetime NOT NULL,
  `typeId` int(11) NOT NULL,
  `sessionId` int(11) DEFAULT NULL,
  `courseId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `notification`
--

INSERT INTO `notification` (`id`, `studentId`, `teacherId`, `isSeen`, `idRead`, `createdAt`, `typeId`, `sessionId`, `courseId`) VALUES
(3, 1, NULL, 0, 0, '2019-10-14 09:11:44', 1, 1, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `notificationtype`
--

CREATE TABLE `notificationtype` (
  `id` int(11) NOT NULL,
  `name` varchar(512) NOT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `notificationtype`
--

INSERT INTO `notificationtype` (`id`, `name`, `createdAt`) VALUES
(1, 'CHANGE_SESSION', '2019-10-13 12:27:20'),
(2, 'CANCEL_SESSION', '2019-10-13 12:27:20'),
(3, 'ADD_SESSION', '2019-10-13 12:27:20');

-- --------------------------------------------------------

--
-- Table structure for table `packagecourse`
--

CREATE TABLE `packagecourse` (
  `id` int(11) NOT NULL,
  `packageId` int(11) NOT NULL,
  `courseId` int(11) NOT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `packagecourse`
--

INSERT INTO `packagecourse` (`id`, `packageId`, `courseId`, `createdAt`) VALUES
(15, 11, 2, '2019-10-03 13:41:31'),
(16, 11, 10, '2019-10-03 14:52:45');

-- --------------------------------------------------------

--
-- Table structure for table `packagestudent`
--

CREATE TABLE `packagestudent` (
  `id` int(11) NOT NULL,
  `studentId` int(11) NOT NULL,
  `cost` int(11) NOT NULL,
  `totalPayment` int(11) NOT NULL,
  `titleEn` varchar(512) NOT NULL,
  `titleAr` varchar(512) NOT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `packagestudent`
--

INSERT INTO `packagestudent` (`id`, `studentId`, `cost`, `totalPayment`, `titleEn`, `titleAr`, `createdAt`) VALUES
(11, 1, 5000, 0, 'Course B', 'كورس لغة B', '2019-10-03 13:41:31');

-- --------------------------------------------------------

--
-- Table structure for table `packagestudentpayment`
--

CREATE TABLE `packagestudentpayment` (
  `id` int(11) NOT NULL,
  `packageId` int(11) NOT NULL,
  `value` int(11) NOT NULL,
  `note` varchar(512) DEFAULT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `property`
--

CREATE TABLE `property` (
  `id` int(11) NOT NULL,
  `nameEn` varchar(512) NOT NULL,
  `nameAr` varchar(512) NOT NULL,
  `type` varchar(512) NOT NULL,
  `status` varchar(512) NOT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `property`
--

INSERT INTO `property` (`id`, `nameEn`, `nameAr`, `type`, `status`, `createdAt`) VALUES
(1, 'has board', 'يوجد لوح', 'check', 'active', '2019-09-30 11:36:03'),
(2, 'chair count', 'عدد المقاعد', 'number', 'active', '2019-09-30 11:36:03'),
(3, 'has projector', 'يوجد بروجكتر', 'check', 'active', '2019-09-30 11:36:03'),
(4, 'has speaker', 'يوجد مكبرات صوت', 'check', 'active', '2019-09-30 11:36:03');

-- --------------------------------------------------------

--
-- Table structure for table `role`
--

CREATE TABLE `role` (
  `id` int(11) NOT NULL,
  `name` varchar(512) NOT NULL,
  `description` varchar(512) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `modified` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `role`
--

INSERT INTO `role` (`id`, `name`, `description`, `created`, `modified`) VALUES
(1, 'super-admin', 'brain socket admin', '2019-09-30 11:36:01', '2019-09-30 11:36:01'),
(2, 'user-institute', 'user institute', '2019-09-30 11:36:01', '2019-09-30 11:36:01'),
(3, 'student', 'student', '2019-09-30 11:36:01', '2019-09-30 11:36:01'),
(4, 'teacher', 'teacher', '2019-09-30 11:36:01', '2019-09-30 11:36:01');

-- --------------------------------------------------------

--
-- Table structure for table `rolemapping`
--

CREATE TABLE `rolemapping` (
  `id` int(11) NOT NULL,
  `principalType` varchar(512) DEFAULT NULL,
  `principalId` varchar(255) DEFAULT NULL,
  `roleId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `rolemapping`
--

INSERT INTO `rolemapping` (`id`, `principalType`, `principalId`, `roleId`) VALUES
(1, 'admin', '1', 1),
(2, 'userInstitute', '1', 2),
(3, 'userInstitute', '2', 2),
(4, 'userInstitute', '3', 2),
(5, 'userInstitute', '4', 2),
(6, 'student', '1', 3),
(7, 'teacher', '1', 4);

-- --------------------------------------------------------

--
-- Table structure for table `session`
--

CREATE TABLE `session` (
  `id` int(11) NOT NULL,
  `courseId` int(11) NOT NULL,
  `venueId` int(11) NOT NULL,
  `startAt` datetime NOT NULL,
  `endAt` datetime NOT NULL,
  `status` varchar(512) NOT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `session`
--

INSERT INTO `session` (`id`, `courseId`, `venueId`, `startAt`, `endAt`, `status`, `createdAt`) VALUES
(1, 2, 1, '2019-11-03 16:00:00', '2019-11-03 16:00:00', 'active', '2019-10-01 13:43:31'),
(2, 10, 1, '2019-11-01 16:30:00', '2019-11-01 18:00:00', 'active', '2019-10-01 13:51:28'),
(3, 2, 1, '2018-11-03 16:00:00', '2018-11-03 16:00:00', 'active', '2019-10-03 09:30:14');

-- --------------------------------------------------------

--
-- Table structure for table `student`
--

CREATE TABLE `student` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `instituteId` int(11) NOT NULL,
  `branchId` int(11) NOT NULL,
  `email` varchar(512) DEFAULT NULL,
  `status` varchar(512) NOT NULL,
  `createdAt` datetime NOT NULL,
  `realm` varchar(512) DEFAULT NULL,
  `username` varchar(512) DEFAULT NULL,
  `password` varchar(512) NOT NULL,
  `emailVerified` tinyint(1) DEFAULT NULL,
  `verificationToken` varchar(512) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `student`
--

INSERT INTO `student` (`id`, `userId`, `instituteId`, `branchId`, `email`, `status`, `createdAt`, `realm`, `username`, `password`, `emailVerified`, `verificationToken`) VALUES
(1, 1, 1, 1, NULL, 'active', '2019-09-30 12:48:57', NULL, NULL, '$2a$10$hTpLNW/9WScANONpH8xufuouYlzPjZq.UhWGZXrNX1jPQ22NA.nl.', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `studentcourse`
--

CREATE TABLE `studentcourse` (
  `id` int(11) NOT NULL,
  `studentId` int(11) NOT NULL,
  `courseId` int(11) NOT NULL,
  `isInQueue` tinyint(1) NOT NULL,
  `order` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `studentcourse`
--

INSERT INTO `studentcourse` (`id`, `studentId`, `courseId`, `isInQueue`, `order`, `createdAt`) VALUES
(7, 1, 2, 0, NULL, '2019-10-03 12:28:19'),
(8, 1, 10, 0, NULL, '2019-10-03 14:48:00');

-- --------------------------------------------------------

--
-- Table structure for table `studentsession`
--

CREATE TABLE `studentsession` (
  `id` int(11) NOT NULL,
  `sessionId` int(11) NOT NULL,
  `studentId` int(11) NOT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `studentsession`
--

INSERT INTO `studentsession` (`id`, `sessionId`, `studentId`, `createdAt`) VALUES
(4, 1, 1, '2019-10-03 13:41:32'),
(5, 3, 1, '2019-10-03 13:41:32'),
(6, 2, 1, '2019-10-03 14:52:45');

-- --------------------------------------------------------

--
-- Table structure for table `subcategory`
--

CREATE TABLE `subcategory` (
  `id` int(11) NOT NULL,
  `nameEn` varchar(512) NOT NULL,
  `nameAr` varchar(512) NOT NULL,
  `subjectId` int(11) DEFAULT NULL,
  `subcategoryId` int(11) DEFAULT NULL,
  `status` varchar(512) NOT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `subcategory`
--

INSERT INTO `subcategory` (`id`, `nameEn`, `nameAr`, `subjectId`, `subcategoryId`, `status`, `createdAt`) VALUES
(1, 'ninth class', 'صف تاسع', 1, NULL, 'active', '2019-09-30 11:36:03'),
(2, 'tenth class', 'صف عاشر', 1, NULL, 'active', '2019-09-30 11:36:03'),
(3, 'new headway', 'نيو هيد وي', 4, NULL, 'active', '2019-09-30 11:36:03'),
(4, 'level 4', 'مستوى 4', NULL, 3, 'active', '2019-09-30 11:36:03'),
(5, 'B', 'B', NULL, 4, 'active', '2019-09-30 11:36:03'),
(6, 'fourth class', 'صف رابع', 3, NULL, 'active', '2019-09-30 11:36:03'),
(7, 'first section', 'الفصل الأول', NULL, 6, 'active', '2019-09-30 11:36:03');

-- --------------------------------------------------------

--
-- Table structure for table `subject`
--

CREATE TABLE `subject` (
  `id` int(11) NOT NULL,
  `nameEn` varchar(512) NOT NULL,
  `nameAr` varchar(512) NOT NULL,
  `categoryId` int(11) NOT NULL,
  `status` varchar(512) NOT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `subject`
--

INSERT INTO `subject` (`id`, `nameEn`, `nameAr`, `categoryId`, `status`, `createdAt`) VALUES
(1, 'math', 'رياضيات', 1, 'active', '2019-09-30 11:36:02'),
(2, 'physics', 'الفيزياء', 1, 'active', '2019-09-30 11:36:02'),
(3, 'history', 'تاريخ', 2, 'active', '2019-09-30 11:36:02'),
(4, 'english', 'انكليزي', 3, 'active', '2019-09-30 11:36:02'),
(5, 'french', 'فرنسي', 3, 'active', '2019-09-30 11:36:02');

-- --------------------------------------------------------

--
-- Table structure for table `teacher`
--

CREATE TABLE `teacher` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `instituteId` int(11) NOT NULL,
  `email` varchar(512) DEFAULT NULL,
  `status` varchar(512) NOT NULL,
  `createdAt` datetime NOT NULL,
  `realm` varchar(512) DEFAULT NULL,
  `username` varchar(512) DEFAULT NULL,
  `password` varchar(512) NOT NULL,
  `emailVerified` tinyint(1) DEFAULT NULL,
  `verificationToken` varchar(512) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `teacher`
--

INSERT INTO `teacher` (`id`, `userId`, `instituteId`, `email`, `status`, `createdAt`, `realm`, `username`, `password`, `emailVerified`, `verificationToken`) VALUES
(1, 2, 1, NULL, 'active', '2019-09-30 13:04:11', NULL, NULL, '$2a$10$g1kBalE8pnRDOAigBo66WuST.OiknjxxyGE7fO46TNkNZrjQbBXY6', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `teachercourse`
--

CREATE TABLE `teachercourse` (
  `id` int(11) NOT NULL,
  `courseId` int(11) NOT NULL,
  `teacherId` int(11) NOT NULL,
  `typePaid` varchar(512) NOT NULL,
  `value` int(11) NOT NULL,
  `totalPayment` int(11) NOT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `teachercourse`
--

INSERT INTO `teachercourse` (`id`, `courseId`, `teacherId`, `typePaid`, `value`, `totalPayment`, `createdAt`) VALUES
(1, 2, 1, 'fixed', 20000, 10000, '2019-10-01 15:17:38');

-- --------------------------------------------------------

--
-- Table structure for table `teachercoursepayment`
--

CREATE TABLE `teachercoursepayment` (
  `id` int(11) NOT NULL,
  `teacherCourseId` int(11) NOT NULL,
  `value` int(11) NOT NULL,
  `note` varchar(512) DEFAULT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `teachercoursepayment`
--

INSERT INTO `teachercoursepayment` (`id`, `teacherCourseId`, `value`, `note`, `createdAt`) VALUES
(1, 1, 5000, NULL, '2019-10-02 08:52:33'),
(2, 1, 5000, 'by ahmad', '2019-10-02 08:52:59');

-- --------------------------------------------------------

--
-- Table structure for table `teachersubcategory`
--

CREATE TABLE `teachersubcategory` (
  `id` int(11) NOT NULL,
  `teacherId` int(11) NOT NULL,
  `subcategoryId` int(11) NOT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `teachersubcategory`
--

INSERT INTO `teachersubcategory` (`id`, `teacherId`, `subcategoryId`, `createdAt`) VALUES
(1, 1, 7, '2019-09-30 13:05:04'),
(2, 1, 5, '2019-09-30 13:05:04');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `phonenumber` varchar(512) NOT NULL,
  `name` varchar(512) NOT NULL,
  `gender` varchar(512) NOT NULL,
  `birthdate` datetime NOT NULL,
  `email` varchar(512) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `phonenumber`, `name`, `gender`, `birthdate`, `email`) VALUES
(1, '+963957465876', 'anas alazmeh', 'male', '1995-06-25 09:24:20', NULL),
(2, '+96395746587', 'ahmad ataya', 'male', '1994-05-24 21:00:00', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `userinstitute`
--

CREATE TABLE `userinstitute` (
  `id` int(11) NOT NULL,
  `gender` varchar(512) NOT NULL,
  `birthdate` datetime NOT NULL,
  `name` varchar(512) NOT NULL,
  `email` varchar(512) NOT NULL,
  `realm` varchar(512) DEFAULT NULL,
  `username` varchar(512) DEFAULT NULL,
  `password` varchar(512) NOT NULL,
  `emailVerified` tinyint(1) DEFAULT NULL,
  `verificationToken` varchar(512) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `userinstitute`
--

INSERT INTO `userinstitute` (`id`, `gender`, `birthdate`, `name`, `email`, `realm`, `username`, `password`, `emailVerified`, `verificationToken`) VALUES
(1, 'male', '1992-09-24 07:15:03', 'molham mahmod', 'molham@new-horizon.com', NULL, NULL, '$2a$10$Ag68/mF298qTOQZCjMC/Qun8dh0yDhjmHa4mylT8iyvzK4PhtAX4W', NULL, NULL),
(2, 'male', '1995-09-24 10:15:03', 'rami alzebk', 'rami@alrayan.com', NULL, NULL, '$2a$10$.MGk5Ve/c/9tW6DHvpan0eIqMjHUqsrbw.2xcUesKllCz3l9veVTO', NULL, NULL),
(3, 'male', '1995-09-24 10:15:03', 'molham mahmod 2', 'molham2@new-horizon.com', NULL, NULL, '$2a$10$qQv9ufodxZWmN8CVka0GpOtuTmF4X0xnALTo6HrTi/ipYn4QZ1cvO', NULL, NULL),
(4, 'male', '1995-09-24 10:15:03', 'abd alrahman hayek', 'abd-alrahman-hayek@email.com', NULL, NULL, '$2a$10$cAU2IK.amkdtzb8ISreCLOWC0J3tvNXspTi75SLoeHXT53g177ade', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `venue`
--

CREATE TABLE `venue` (
  `id` int(11) NOT NULL,
  `instituteId` int(11) NOT NULL,
  `branchId` int(11) NOT NULL,
  `nameEn` varchar(512) NOT NULL,
  `nameAr` varchar(512) NOT NULL,
  `type` varchar(512) NOT NULL,
  `status` varchar(512) NOT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `venue`
--

INSERT INTO `venue` (`id`, `instituteId`, `branchId`, `nameEn`, `nameAr`, `type`, `status`, `createdAt`) VALUES
(1, 1, 1, 'room 1', 'القاعة 1', 'قاعة محاضرات', 'active', '2019-09-30 12:42:03');

-- --------------------------------------------------------

--
-- Table structure for table `venueimages`
--

CREATE TABLE `venueimages` (
  `id` int(11) NOT NULL,
  `venueId` int(11) NOT NULL,
  `imageId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `venueimages`
--

INSERT INTO `venueimages` (`id`, `venueId`, `imageId`) VALUES
(2, 1, 3);

-- --------------------------------------------------------

--
-- Table structure for table `venueproperties`
--

CREATE TABLE `venueproperties` (
  `id` int(11) NOT NULL,
  `venueId` int(11) NOT NULL,
  `propertyId` int(11) NOT NULL,
  `value` varchar(512) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `venueproperties`
--

INSERT INTO `venueproperties` (`id`, `venueId`, `propertyId`, `value`) VALUES
(5, 1, 1, 'false'),
(6, 1, 2, '0'),
(7, 1, 3, 'true'),
(8, 1, 4, 'true');

-- --------------------------------------------------------

--
-- Table structure for table `verificationcode`
--

CREATE TABLE `verificationcode` (
  `id` int(11) NOT NULL,
  `code` int(11) NOT NULL,
  `typeUser` varchar(512) NOT NULL,
  `userId` int(11) NOT NULL,
  `expiredDate` datetime NOT NULL,
  `status` varchar(512) NOT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `verificationcode`
--

INSERT INTO `verificationcode` (`id`, `code`, `typeUser`, `userId`, `expiredDate`, `status`, `createdAt`) VALUES
(1, 35956, 'student', 1, '2019-09-30 14:48:57', 'used', '2019-09-30 12:48:57');

-- --------------------------------------------------------

--
-- Table structure for table `waitinglist`
--

CREATE TABLE `waitinglist` (
  `id` int(11) NOT NULL,
  `titleEn` varchar(512) NOT NULL,
  `titleAr` varchar(512) NOT NULL,
  `instituteId` int(11) NOT NULL,
  `subcategoryId` int(11) NOT NULL,
  `inceptionCount` int(11) NOT NULL,
  `count` int(11) NOT NULL,
  `note` varchar(512) DEFAULT NULL,
  `status` varchar(512) NOT NULL,
  `createdAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `waitinglist`
--

INSERT INTO `waitinglist` (`id`, `titleEn`, `titleAr`, `instituteId`, `subcategoryId`, `inceptionCount`, `count`, `note`, `status`, `createdAt`) VALUES
(1, 'English course level 4 B', 'كورس انكليزي مستوى رابع B', 1, 5, 4, 1, NULL, 'active', '2019-09-30 13:42:35'),
(2, 'tenth', 'صف عاشر', 1, 2, 4, 1, NULL, 'active', '2019-10-09 08:28:58');

-- --------------------------------------------------------

--
-- Table structure for table `waitingliststudent`
--

CREATE TABLE `waitingliststudent` (
  `id` int(11) NOT NULL,
  `waitingListId` int(11) NOT NULL,
  `studentId` int(11) NOT NULL,
  `branchId` int(11) NOT NULL,
  `note` varchar(512) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `payment` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `waitingliststudent`
--

INSERT INTO `waitingliststudent` (`id`, `waitingListId`, `studentId`, `branchId`, `note`, `createdAt`, `payment`) VALUES
(2, 2, 1, 1, NULL, '2019-10-09 08:36:36', 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `accesstoken`
--
ALTER TABLE `accesstoken`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `acl`
--
ALTER TABLE `acl`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `branch`
--
ALTER TABLE `branch`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `branchadmin`
--
ALTER TABLE `branchadmin`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `branchimages`
--
ALTER TABLE `branchimages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `category`
--
ALTER TABLE `category`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `course`
--
ALTER TABLE `course`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `courseimages`
--
ALTER TABLE `courseimages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `institute`
--
ALTER TABLE `institute`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `instituteadmin`
--
ALTER TABLE `instituteadmin`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `institutesimages`
--
ALTER TABLE `institutesimages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `media`
--
ALTER TABLE `media`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `multiaccesstoken`
--
ALTER TABLE `multiaccesstoken`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`),
  ADD KEY `principalType` (`principalType`);

--
-- Indexes for table `notification`
--
ALTER TABLE `notification`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notificationtype`
--
ALTER TABLE `notificationtype`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `packagecourse`
--
ALTER TABLE `packagecourse`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `packagestudent`
--
ALTER TABLE `packagestudent`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `packagestudentpayment`
--
ALTER TABLE `packagestudentpayment`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `property`
--
ALTER TABLE `property`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `rolemapping`
--
ALTER TABLE `rolemapping`
  ADD PRIMARY KEY (`id`),
  ADD KEY `principalId` (`principalId`);

--
-- Indexes for table `session`
--
ALTER TABLE `session`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `student`
--
ALTER TABLE `student`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `studentcourse`
--
ALTER TABLE `studentcourse`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `studentsession`
--
ALTER TABLE `studentsession`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `subcategory`
--
ALTER TABLE `subcategory`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `subject`
--
ALTER TABLE `subject`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `teacher`
--
ALTER TABLE `teacher`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `teachercourse`
--
ALTER TABLE `teachercourse`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `teachercoursepayment`
--
ALTER TABLE `teachercoursepayment`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `teachersubcategory`
--
ALTER TABLE `teachersubcategory`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `userinstitute`
--
ALTER TABLE `userinstitute`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `venue`
--
ALTER TABLE `venue`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `venueimages`
--
ALTER TABLE `venueimages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `venueproperties`
--
ALTER TABLE `venueproperties`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `verificationcode`
--
ALTER TABLE `verificationcode`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `waitinglist`
--
ALTER TABLE `waitinglist`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `waitingliststudent`
--
ALTER TABLE `waitingliststudent`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `acl`
--
ALTER TABLE `acl`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `branch`
--
ALTER TABLE `branch`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `branchadmin`
--
ALTER TABLE `branchadmin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `branchimages`
--
ALTER TABLE `branchimages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `category`
--
ALTER TABLE `category`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `course`
--
ALTER TABLE `course`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `courseimages`
--
ALTER TABLE `courseimages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `institute`
--
ALTER TABLE `institute`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `instituteadmin`
--
ALTER TABLE `instituteadmin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `institutesimages`
--
ALTER TABLE `institutesimages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `media`
--
ALTER TABLE `media`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `notification`
--
ALTER TABLE `notification`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `notificationtype`
--
ALTER TABLE `notificationtype`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `packagecourse`
--
ALTER TABLE `packagecourse`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `packagestudent`
--
ALTER TABLE `packagestudent`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `packagestudentpayment`
--
ALTER TABLE `packagestudentpayment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `property`
--
ALTER TABLE `property`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `role`
--
ALTER TABLE `role`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `rolemapping`
--
ALTER TABLE `rolemapping`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `session`
--
ALTER TABLE `session`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `student`
--
ALTER TABLE `student`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `studentcourse`
--
ALTER TABLE `studentcourse`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `studentsession`
--
ALTER TABLE `studentsession`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `subcategory`
--
ALTER TABLE `subcategory`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `subject`
--
ALTER TABLE `subject`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `teacher`
--
ALTER TABLE `teacher`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `teachercourse`
--
ALTER TABLE `teachercourse`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `teachercoursepayment`
--
ALTER TABLE `teachercoursepayment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `teachersubcategory`
--
ALTER TABLE `teachersubcategory`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `userinstitute`
--
ALTER TABLE `userinstitute`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `venue`
--
ALTER TABLE `venue`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `venueimages`
--
ALTER TABLE `venueimages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `venueproperties`
--
ALTER TABLE `venueproperties`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `verificationcode`
--
ALTER TABLE `verificationcode`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `waitinglist`
--
ALTER TABLE `waitinglist`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `waitingliststudent`
--
ALTER TABLE `waitingliststudent`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
