import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AdminOperationsService, CashAudit, Expense, ExpenseCategory } from '../../../core/services/admin-operations.service';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({selector:'app-admin-finance',standalone:true,imports:[CommonModule,FormsModule,IconComponent],templateUrl:'./finance.html',styleUrl:'../admin-operations.css'})
export class AdminFinance implements OnInit {
  private api=inject(AdminOperationsService);
  tab=signal<'expenses'|'audits'|'categories'>('expenses'); expenses=signal<Expense[]>([]); categories=signal<ExpenseCategory[]>([]); audits=signal<CashAudit[]>([]); error=signal(''); modal=signal<'expense'|'reverse'|'category'|null>(null); selected=signal<Expense|null>(null);
  draft={category_id:'',description:'',amount:0,payment_method:'cash',receipt_ref:'',expense_date:new Date().toISOString().slice(0,10)}; reason=''; categoryName='';
  expenseTotal=computed(()=>this.expenses().reduce((sum,item)=>sum+(item.entry_type==='reversal'?-Number(item.amount):Number(item.amount)),0));
  auditDifference=computed(()=>this.audits().reduce((sum,item)=>sum+Number(item.difference||0),0));
  ngOnInit(){this.load();}
  load(){forkJoin({expenses:this.api.expenses(),categories:this.api.expenseCategories(),audits:this.api.audits()}).subscribe({next:value=>{this.expenses.set(value.expenses);this.categories.set(value.categories);this.audits.set(value.audits);},error:e=>this.error.set(e.error?.error||'No se pudo cargar finanzas.')});}
  openExpense(){this.draft={category_id:this.categories()[0]?.id||'',description:'',amount:0,payment_method:'cash',receipt_ref:'',expense_date:new Date().toISOString().slice(0,10)};this.modal.set('expense');}
  saveExpense(){this.api.createExpense(this.draft).subscribe({next:()=>{this.modal.set(null);this.load();},error:e=>this.error.set(e.error?.error||'No se pudo registrar el gasto.')});}
  openReverse(item:Expense){this.selected.set(item);this.reason='';this.modal.set('reverse');}
  reverse(){const item=this.selected();if(!item)return;this.api.reverseExpense(item.id,this.reason).subscribe({next:()=>{this.modal.set(null);this.load();},error:e=>this.error.set(e.error?.error||'No se pudo revertir.')});}
  saveCategory(){this.api.createExpenseCategory(this.categoryName).subscribe({next:()=>{this.categoryName='';this.modal.set(null);this.load();},error:e=>this.error.set(e.error?.error||'No se pudo crear la categoría.')});}
  isReversed(item:Expense){return this.expenses().some(row=>row.reverses_expense_id===item.id);}
  money(value:number|string|undefined){return Number(value||0).toLocaleString('es-MX',{style:'currency',currency:'MXN'});}
}
