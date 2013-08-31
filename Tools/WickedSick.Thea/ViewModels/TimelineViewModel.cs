﻿using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Windows.Data;
using Newtonsoft.Json;
using WickedSick.Thea.Helpers;
using WickedSick.Thea.Models;

namespace WickedSick.Thea.ViewModels
{
    public class TimelineViewModel : MVVM.ViewModelBase
    {
        public IJavascriptContext JsContext { get; set; }

        public ObservableCollection<TimelineGroup> Items { get; private set; }
        public CollectionView SortedItems { get; private set; }
        public TimelineGroup LastItem { get { return (TimelineGroup)SortedItems.GetItemAt(Items.Count - 1); } }

        private int _TotalLength;
        public int TotalLength
        {
            get { return _TotalLength; }
            set
            {
                _TotalLength = value;
                OnPropertyChanged("TotalLength");
            }
        }

        public TimelineViewModel()
        {
            Items = new ObservableCollection<TimelineGroup>();
            Items.CollectionChanged += Items_CollectionChanged;
            Items.Add(new TimelineGroup() { Data = "App.Resources", Start = 2, Length = 0, Type = "Parse" });
            Items.Add(new TimelineGroup() { Data = "App", Start = 3, Length = 4, Type = "Parse" });
            Items.Add(new TimelineGroup() { Data = "", Start = 38, Length = 11, Type = "LayoutPass" });
            Items.Add(new TimelineGroup() { Data = "Page", Start = 236, Length = 106, Type = "Parse" });
            Items.Add(new TimelineGroup() { Data = "http://localhost/NflDraft/default.fap#", Start = 8, Length = 335, Type = "Navigate" });
            Items.Add(new TimelineGroup() { Data = "", Start = 334, Length = 451, Type = "LayoutPass" });

            SortedItems = (CollectionView)CollectionViewSource.GetDefaultView(Items);
            SortedItems.SortDescriptions.Add(new SortDescription("Start", ListSortDirection.Ascending));
        }

        void Items_CollectionChanged(object sender, System.Collections.Specialized.NotifyCollectionChangedEventArgs e)
        {
            OnPropertyChanged("LastItem");
        }

        public void Update()
        {
            var grps = GetTimelineGroups().ToList();
            if (grps.Count != Items.Count)
            {
                Items.Clear();
                grps.ForEach(Items.Add);
                TotalLength = Items.Max(tg => tg.Start + tg.Length);
            }
        }

        protected IEnumerable<TimelineGroup> GetTimelineGroups()
        {
            if (JsContext == null)
                return Enumerable.Empty<TimelineGroup>();
            if (!JsContext.IsAlive)
                return Enumerable.Empty<TimelineGroup>();
            var json = JsContext.Eval("JSON.stringify(TimelineProfile.Groups)");
            return JsonConvert.DeserializeObject<List<TimelineGroup>>(json);
        }
    }
}