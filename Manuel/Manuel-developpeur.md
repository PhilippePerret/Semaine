# Semaine<br>Manuel développeur



## Introduction

Ce document présente ce qu’il faut savoir pour développer cette application.



## Gestion des dates

Une des difficultés majeures est la gestion des jours.

Il existe deux types de semaine : 

* la semaine réelle telle qu’on la compte dans une année, qui ne commence pas forcément par lundi. Par exemple, en 2020, cette semaine commençait tous les mercredis (car le premier jour de l’année était un mercredi)
* la semaine « programme » qui correspond vraiment aux semaines allant du lundi au samedi ou au dimanche. Cette semaine possède la classe **`SemaineLogique`**.